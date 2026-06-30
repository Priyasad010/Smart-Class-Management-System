const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route to get all halls
router.get('/', verifyToken, checkRole(['Admin', 'Teacher', 'Counter Person']), hallController.getAllHalls);
router.post('/', verifyToken, checkRole(['Admin']), hallController.createHall);
router.delete('/:id', verifyToken, checkRole(['Admin']), hallController.deleteHall);

module.exports = router;