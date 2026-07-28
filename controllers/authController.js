const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { User } = require('../models');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, nom: user.nom, email: user.email };
}

exports.register = async (req, res, next) => {
  try {
    const { nom, email, mot_de_passe: motDePasse } = req.body;

    if (!nom || !email || !motDePasse) {
      throw createError(400, 'nom, email et mot_de_passe sont requis');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw createError(409, 'Un compte existe déjà avec cet email');
    }

    const hash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
    const user = await User.create({ nom, email, motDePasse: hash });

    const token = signToken({ id: user.id, email: user.email });
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, mot_de_passe: motDePasse } = req.body;

    if (!email || !motDePasse) {
      throw createError(400, 'email et mot_de_passe sont requis');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError(401, 'Identifiants invalides');
    }

    const valid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valid) {
      throw createError(401, 'Identifiants invalides');
    }

    const token = signToken({ id: user.id, email: user.email });
    res.json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  // JWT sans état : la déconnexion consiste à supprimer le token côté client.
  res.status(204).send();
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw createError(404, 'Utilisateur introuvable');
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};
