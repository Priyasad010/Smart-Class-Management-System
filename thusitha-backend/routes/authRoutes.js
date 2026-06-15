const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register); // If you have a general register
router.patch('/reset-password', verifyToken, authController.resetPassword);

module.exports = router;