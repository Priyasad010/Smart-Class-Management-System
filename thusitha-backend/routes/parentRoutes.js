const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, parentController.getAllParents);
router.post('/register', verifyToken, checkRole(['Admin', 'Counter Person']), parentController.registerParent);

module.exports = router;