const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public route for submitting inquiries
router.post('/submit', contactController.submitInquiry);

// Protected routes for managing inquiries (Admin only)
router.get('/messages', verifyToken, checkRole(['Admin']), contactController.getMessages);
router.patch('/read/:messageId', verifyToken, checkRole(['Admin']), contactController.markAsRead);
router.patch('/mark-all-read', verifyToken, checkRole(['Admin']), contactController.markAllAsRead);
router.patch('/important/:messageId', verifyToken, checkRole(['Admin']), contactController.toggleImportant);
router.patch('/spam/:messageId', verifyToken, checkRole(['Admin']), contactController.markAsSpam); // Assuming markAsSpam exists in controller
router.patch('/recover/:messageId', verifyToken, checkRole(['Admin']), contactController.recoverFromSpam); // Assuming recoverFromSpam exists in controller
router.delete('/bulk-delete-spam', verifyToken, checkRole(['Admin']), contactController.bulkDeleteSpam);

module.exports = router;