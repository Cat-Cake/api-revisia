const createError = require('http-errors');
const { verifyToken } = require('../utils/jwt');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(createError(401, 'Authentification requise'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    next(createError(401, 'Token invalide ou expiré'));
  }
};
