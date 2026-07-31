const { Flashcard, Quiz } = require('../models');
const ollamaService = require('./ollamaService');

async function generateFlashcardsForDocument(document, count = 5) {
  const generated = await ollamaService.generateFlashcards(document.texte, count);
  await Flashcard.destroy({ where: { documentId: document.id } });

  return Flashcard.bulkCreate(
    generated.map((f) => ({ documentId: document.id, question: f.question, reponse: f.reponse })),
    { returning: true },
  );
}

async function generateQuizForDocument(document, count = 5) {
  const generated = await ollamaService.generateQuiz(document.texte, count);
  await Quiz.destroy({ where: { documentId: document.id } });

  return Quiz.bulkCreate(
    generated.map((q) => ({
      documentId: document.id,
      question: q.question,
      propositions: q.propositions,
      bonneReponse: q.bonne_reponse,
    })),
    { returning: true },
  );
}

module.exports = { generateFlashcardsForDocument, generateQuizForDocument };
