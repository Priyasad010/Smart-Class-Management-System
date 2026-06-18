const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route to get all audit logs (Admin only)
router.get('/logs', verifyToken, checkRole(['Admin']), auditController.getAllLogs);

module.exports = router;