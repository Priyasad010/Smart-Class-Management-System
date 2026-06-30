const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for system settings (Admin only)
router.get('/', verifyToken, checkRole(['Admin']), settingsController.getSettings);
router.post('/create', verifyToken, checkRole(['Admin']), settingsController.createSetting);
router.post('/update', verifyToken, checkRole(['Admin']), settingsController.updateSetting);
router.delete('/delete/:key', verifyToken, checkRole(['Admin']), settingsController.deleteSetting);

module.exports = router;