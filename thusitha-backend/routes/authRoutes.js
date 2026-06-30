const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route for login
router.post('/login', authController.login);
// Protected route for password reset (requires authentication)
router.post('/reset-password', verifyToken, authController.resetPassword);

// Public route for forgot password
router.post('/forgot-password', authController.forgotPassword);

// Protected route for changing password (first-time student login)
router.post('/change-password', verifyToken, authController.changePassword);

// Protected route for logout
router.post('/logout', verifyToken, authController.logout);

module.exports = router;