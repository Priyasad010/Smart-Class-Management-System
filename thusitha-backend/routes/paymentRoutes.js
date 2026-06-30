const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for payment management
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.recordPayment);
router.get('/student/:studentId', verifyToken, checkRole(['Admin', 'Counter Person', 'Parent']), paymentController.getStudentPayments);
router.post('/remind', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.sendLatePaymentReminders);

router.post('/:id/upload-confirmation', verifyToken, checkRole(['Admin', 'Counter Person', 'Student', 'Parent']), paymentController.uploadConfirmation);
router.put('/:id/verify', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.verifyPayment);
router.get('/:id/receipt', verifyToken, checkRole(['Admin', 'Counter Person', 'Student', 'Parent']), paymentController.getReceipt);
router.get('/reports/overdue', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.getOverduePayments);

module.exports = router;