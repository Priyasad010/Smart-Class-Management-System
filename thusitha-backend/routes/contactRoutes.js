const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/submit', contactController.submitInquiry); // Public route
router.get('/messages', verifyToken, checkRole(['Admin']), contactController.getMessages);
router.patch('/read/:messageId', verifyToken, checkRole(['Admin']), contactController.markAsRead);
router.patch('/mark-all-read', verifyToken, checkRole(['Admin']), contactController.markAllAsRead);
router.patch('/important/:messageId', verifyToken, checkRole(['Admin']), contactController.toggleImportant);

module.exports = router;