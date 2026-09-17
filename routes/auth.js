const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.me);
router.put('/me', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

module.exports = router;
