const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route to get all halls
router.get('/', verifyToken, checkRole(['Admin', 'Teacher', 'Counter Person']), hallController.getAllHalls);

module.exports = router;