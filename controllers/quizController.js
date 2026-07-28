const createError = require('http-errors');
const { Quiz, Result, Document } = require('../models');
const { findOwnedDocument } = require('./documentController');

exports.submit = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const { reponses } = req.body;

    if (!Array.isArray(reponses) || reponses.length === 0) {
      throw createError(400, 'reponses (tableau de {quizId, reponse}) est requis');
    }

    const quizItems = await Quiz.findAll({ where: { documentId: document.id } });
    const quizById = new Map(quizItems.map((q) => [q.id, q]));

    let score = 0;
    const corrections = reponses.map(({ quizId, reponse }) => {
      const quizItem = quizById.get(Number(quizId));
      if (!quizItem) {
        return { quizId, correct: false, error: 'Question introuvable' };
      }
      const correct = quizItem.bonneReponse === reponse;
      if (correct) score += 1;
      return {
        quizId: quizItem.id,
        question: quizItem.question,
        reponseDonnee: reponse,
        bonneReponse: quizItem.bonneReponse,
        correct,
      };
    });

    const result = await Result.create({
      utilisateurId: req.user.id,
      documentId: document.id,
      score,
      total: reponses.length,
    });

    res.status(201).json({
      resultId: result.id,
      score,
      total: reponses.length,
      corrections,
    });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const results = await Result.findAll({
      where: { utilisateurId: req.user.id },
      include: [{ model: Document, attributes: ['id', 'nom'] }],
      order: [['date', 'DESC']],
    });
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const result = await Result.findOne({
      where: { id: req.params.id, utilisateurId: req.user.id },
      include: [{ model: Document, attributes: ['id', 'nom'] }],
    });
    if (!result) {
      throw createError(404, 'Résultat introuvable');
    }
    res.json({ result });
  } catch (err) {
    next(err);
  }
};
