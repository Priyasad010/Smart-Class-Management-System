const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected routes for payment management
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.recordPayment);
router.get('/student/:studentId', verifyToken, checkRole(['Admin', 'Counter Person', 'Parent', 'Student']), paymentController.getStudentPayments);
router.post('/remind', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.sendLatePaymentReminders);

// New Student Payment routes
router.get('/my-payments', verifyToken, checkRole(['Student', 'Parent']), paymentController.getMyPayments);
router.post('/student/upload-slip', verifyToken, checkRole(['Student', 'Parent']), upload.single('slip'), paymentController.uploadStudentSlip);
router.post('/student/stripe-checkout', verifyToken, checkRole(['Student', 'Parent']), paymentController.initiateStripeCheckout);
router.post('/student/confirm-stripe', verifyToken, checkRole(['Student', 'Parent']), paymentController.confirmStripePayment);

// New Admin/Counter status check and single reminder routes
router.get('/course-status', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.getCoursePaymentStatus);
router.post('/remind-single', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.sendSinglePaymentReminder);

router.post('/:id/upload-confirmation', verifyToken, checkRole(['Admin', 'Counter Person', 'Student', 'Parent']), paymentController.uploadConfirmation);
router.put('/:id/verify', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.verifyPayment);
router.get('/:id/receipt', verifyToken, checkRole(['Admin', 'Counter Person', 'Student', 'Parent']), paymentController.getReceipt);
router.get('/reports/overdue', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.getOverduePayments);

module.exports = router;