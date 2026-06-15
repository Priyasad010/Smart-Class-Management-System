const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/revenue', verifyToken, checkRole(['Admin']), reportController.getMonthlyRevenue);
router.get('/attendance-stats', verifyToken, checkRole(['Admin']), reportController.getDailyAttendanceStats);
router.get('/student-correlation', verifyToken, checkRole(['Admin']), reportController.getStudentCorrelation);

module.exports = router;