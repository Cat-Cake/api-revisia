const { Document, Result, sequelize } = require('../models');

exports.get = async (req, res, next) => {
  try {
    const utilisateurId = req.user.id;

    const [nombreDocuments, nombreQuizRealises, results, dernieresDocuments, dernieresResultats] =
      await Promise.all([
        Document.count({ where: { utilisateurId } }),
        Result.count({ where: { utilisateurId } }),
        Result.findAll({ where: { utilisateurId }, attributes: ['score', 'total'] }),
        Document.findAll({
          where: { utilisateurId },
          order: [['dateImport', 'DESC']],
          limit: 5,
          attributes: ['id', 'nom', 'dateImport'],
        }),
        Result.findAll({
          where: { utilisateurId },
          order: [['date', 'DESC']],
          limit: 5,
          attributes: ['id', 'documentId', 'score', 'total', 'date'],
        }),
      ]);

    const scoreMoyen = results.length
      ? Math.round(
          (results.reduce((sum, r) => sum + r.score / r.total, 0) / results.length) * 100,
        )
      : null;

    const activites = [
      ...dernieresDocuments.map((d) => ({
        type: 'import_document',
        documentId: d.id,
        nom: d.nom,
        date: d.dateImport,
      })),
      ...dernieresResultats.map((r) => ({
        type: 'quiz_realise',
        documentId: r.documentId,
        score: r.score,
        total: r.total,
        date: r.date,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      nombreDocuments,
      nombreQuizRealises,
      scoreMoyen,
      dernieresActivites: activites,
    });
  } catch (err) {
    next(err);
  }
};
