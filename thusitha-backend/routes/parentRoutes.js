const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for parents
router.get('/', verifyToken, checkRole(['Admin', 'Counter Person']), parentController.getAllParents);
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), parentController.registerParent);

module.exports = router;