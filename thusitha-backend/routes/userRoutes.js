const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route to get all users (excluding students)
router.get('/', verifyToken, checkRole(['Admin']), userController.getAllUsers);

module.exports = router;