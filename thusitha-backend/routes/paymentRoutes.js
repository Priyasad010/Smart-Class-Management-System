const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for payment management
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.recordPayment);
router.get('/student/:studentId', verifyToken, checkRole(['Admin', 'Counter Person', 'Parent']), paymentController.getStudentPayments);
router.post('/remind', verifyToken, checkRole(['Admin', 'Counter Person']), paymentController.sendLatePaymentReminders);

module.exports = router;