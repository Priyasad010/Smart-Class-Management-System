const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All settings routes are restricted to Admin access
// Fetch all current system settings
router.get('/', verifyToken, checkRole(['Admin']), settingsController.getSettings);

// Update a specific setting value (like AI thresholds or late time limits)
router.post('/update', verifyToken, checkRole(['Admin']), settingsController.updateSetting);

// Create a new setting entry (used for adding new dynamic SMS templates)
router.post('/create', verifyToken, checkRole(['Admin']), settingsController.createSetting);

// Remove a setting (used for deleting SMS templates)
router.delete('/delete/:key', verifyToken, checkRole(['Admin']), settingsController.deleteSetting);

module.exports = router;