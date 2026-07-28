const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const documentController = require('../controllers/documentController');
const aiController = require('../controllers/aiController');
const quizController = require('../controllers/quizController');

router.use(auth);

router.post('/', upload.single('file'), documentController.upload);
router.get('/', documentController.list);
router.get('/:id', documentController.getOne);
router.delete('/:id', documentController.remove);

router.post('/:id/summary', aiController.generateSummary);
router.get('/:id/summary', aiController.getSummary);

router.post('/:id/flashcards', aiController.generateFlashcards);
router.get('/:id/flashcards', aiController.getFlashcards);

router.post('/:id/quiz', aiController.generateQuiz);
router.get('/:id/quiz', aiController.getQuiz);
router.post('/:id/quiz/submit', quizController.submit);

module.exports = router;
