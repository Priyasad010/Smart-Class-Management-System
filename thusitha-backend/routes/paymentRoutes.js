const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, checkRole(['Admin', 'Counter Staff']), paymentController.recordPayment);
router.get('/student/:studentId', verifyToken, paymentController.getStudentPayments);

module.exports = router;