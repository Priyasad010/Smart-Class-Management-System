const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route for login
router.post('/login', authController.login);
// Protected route for password reset (requires authentication)
router.post('/reset-password', verifyToken, authController.resetPassword);

module.exports = router;