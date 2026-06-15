const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get all halls (Admin only for now, can be adjusted)
router.get('/', verifyToken, checkRole(['Admin', 'Counter Staff']), hallController.getAllHalls);

module.exports = router;