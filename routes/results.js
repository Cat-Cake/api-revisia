const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const quizController = require('../controllers/quizController');

router.use(auth);

router.get('/', quizController.list);
router.get('/:id', quizController.getOne);

module.exports = router;
