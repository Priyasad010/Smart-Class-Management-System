const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController'); // Assuming you have an whatsappController
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for WhatsApp management (Admin only)
router.get('/logs', verifyToken, checkRole(['Admin']), whatsappController.getWhatsAppLogs); // Assuming getWhatsAppLogs exists in whatsappController
router.post('/resend/:logId', verifyToken, checkRole(['Admin']), whatsappController.resendWhatsApp); // Assuming resendWhatsApp exists
router.post('/bulk-resend', verifyToken, checkRole(['Admin']), whatsappController.bulkResendWhatsApp); // Assuming bulkResendWhatsApp exists
router.post('/bulk-resend-ids', verifyToken, checkRole(['Admin']), whatsappController.bulkResendWhatsAppByIds); // Assuming bulkResendWhatsAppByIds exists
router.post('/send-custom', verifyToken, checkRole(['Admin']), whatsappController.sendCustomWhatsApp); // Assuming sendCustomWhatsApp exists

module.exports = router;