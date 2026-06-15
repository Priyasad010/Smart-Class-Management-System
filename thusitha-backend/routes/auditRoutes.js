const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route to get all logs - restricted to Admin
router.get('/', verifyToken, checkRole(['Admin']), auditController.getAllLogs);

module.exports = router;