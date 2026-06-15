const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Only Admin can manage system users (Teachers/Staff)
router.get('/', verifyToken, checkRole(['Admin']), userController.getAllUsers);

module.exports = router;