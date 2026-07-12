const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route to get all users (excluding students)
router.get('/', verifyToken, checkRole(['Admin']), userController.getAllUsers);

// Create new user (Admin/Counter Person)
router.post('/', verifyToken, checkRole(['Admin']), userController.createUser);

// Delete user
router.delete('/:id', verifyToken, checkRole(['Admin']), userController.deleteUser);

// Reset password route
router.post('/reset-password/:id', verifyToken, checkRole(['Admin']), userController.resetPassword);

module.exports = router;