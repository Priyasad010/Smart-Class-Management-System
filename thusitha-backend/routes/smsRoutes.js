const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController'); // Assuming you have an smsController
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for SMS management (Admin only)
router.get('/logs', verifyToken, checkRole(['Admin']), smsController.getSmsLogs); // Assuming getSmsLogs exists in smsController
router.post('/resend/:logId', verifyToken, checkRole(['Admin']), smsController.resendSms); // Assuming resendSms exists
router.post('/bulk-resend', verifyToken, checkRole(['Admin']), smsController.bulkResendSms); // Assuming bulkResendSms exists
router.post('/bulk-resend-ids', verifyToken, checkRole(['Admin']), smsController.bulkResendSmsByIds); // Assuming bulkResendSmsByIds exists
router.post('/send-custom', verifyToken, checkRole(['Admin']), smsController.sendCustomSms); // Assuming sendCustomSms exists

module.exports = router;