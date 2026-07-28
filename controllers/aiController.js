const { Summary, Flashcard, Quiz } = require('../models');
const ollamaService = require('../services/ollamaService');
const { findOwnedDocument } = require('./documentController');

exports.generateSummary = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const { court, detaille } = await ollamaService.generateSummary(document.texte);

    const [court_, detaille_] = await Promise.all([
      Summary.upsert({ documentId: document.id, type: 'court', contenu: court }, { returning: true }),
      Summary.upsert({ documentId: document.id, type: 'detaille', contenu: detaille }, { returning: true }),
    ]);

    res.status(201).json({ court: court_[0], detaille: detaille_[0] });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const summaries = await Summary.findAll({ where: { documentId: document.id } });
    res.json({
      court: summaries.find((s) => s.type === 'court') || null,
      detaille: summaries.find((s) => s.type === 'detaille') || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.generateFlashcards = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const count = Number(req.body?.count) || 10;
    const generated = await ollamaService.generateFlashcards(document.texte, count);

    await Flashcard.destroy({ where: { documentId: document.id } });
    const flashcards = await Flashcard.bulkCreate(
      generated.map((f) => ({ documentId: document.id, question: f.question, reponse: f.reponse })),
      { returning: true },
    );

    res.status(201).json({ flashcards });
  } catch (err) {
    next(err);
  }
};

exports.getFlashcards = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const flashcards = await Flashcard.findAll({ where: { documentId: document.id } });
    res.json({ flashcards });
  } catch (err) {
    next(err);
  }
};

exports.generateQuiz = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const count = Number(req.body?.count) || 10;
    const generated = await ollamaService.generateQuiz(document.texte, count);

    await Quiz.destroy({ where: { documentId: document.id } });
    const quiz = await Quiz.bulkCreate(
      generated.map((q) => ({
        documentId: document.id,
        question: q.question,
        propositions: q.propositions,
        bonneReponse: q.bonne_reponse,
      })),
      { returning: true },
    );

    res.status(201).json({ quiz: quiz.map(hideAnswer) });
  } catch (err) {
    next(err);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const quiz = await Quiz.findAll({ where: { documentId: document.id } });
    res.json({ quiz: quiz.map(hideAnswer) });
  } catch (err) {
    next(err);
  }
};

function hideAnswer(quizItem) {
  return {
    id: quizItem.id,
    question: quizItem.question,
    propositions: quizItem.propositions,
  };
}
