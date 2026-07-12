const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for parents
router.get('/', verifyToken, checkRole(['Admin', 'Counter Person']), parentController.getAllParents);
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), parentController.registerParent);
router.get('/my-children', verifyToken, checkRole(['Parent']), parentController.getMyChildrenDetails);

module.exports = router;