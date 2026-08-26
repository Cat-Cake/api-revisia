const { Summary, Flashcard, Quiz } = require('../models');
const ollamaService = require('../services/ollamaService');
const generationService = require('../services/generationService');
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
      generationEnCours: document.statutGeneration === 'en_cours',
    });
  } catch (err) {
    next(err);
  }
};

exports.generateFlashcards = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const count = Number(req.body?.count) || 5;
    const flashcards = await generationService.generateFlashcardsForDocument(document, count);

    res.status(201).json({ flashcards });
  } catch (err) {
    next(err);
  }
};

exports.getFlashcards = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const flashcards = await Flashcard.findAll({ where: { documentId: document.id } });
    res.json({ flashcards, generationEnCours: document.statutGeneration === 'en_cours' });
  } catch (err) {
    next(err);
  }
};

exports.generateQuiz = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const count = Number(req.body?.count) || 5;
    const quiz = await generationService.generateQuizForDocument(document, count);

    res.status(201).json({ quiz: quiz.map(hideAnswer) });
  } catch (err) {
    next(err);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    const quiz = await Quiz.findAll({ where: { documentId: document.id } });
    res.json({ quiz: quiz.map(hideAnswer), generationEnCours: document.statutGeneration === 'en_cours' });
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
