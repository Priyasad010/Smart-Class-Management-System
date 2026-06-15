const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/master/:sessionId', verifyToken, attendanceController.getAttendanceMaster);
router.post('/ai-headcount', attendanceController.updateAIHeadcount); // No token for the AI local script
router.get('/suspicious-logs', verifyToken, checkRole(['Admin']), attendanceController.getSuspiciousLogs);
router.get('/total-suspicious', verifyToken, checkRole(['Admin']), attendanceController.getTotalSuspiciousIncidents);
router.get('/hall-occupancy', verifyToken, checkRole(['Admin']), attendanceController.getHallOccupancyStats);
router.get('/active-congestions', verifyToken, checkRole(['Admin']), attendanceController.getActiveCongestions);
router.get('/predictive-occupancy', verifyToken, attendanceController.getPredictiveOccupancy);
router.get('/health-stats', verifyToken, checkRole(['Admin']), attendanceController.getAIHealthStats);
router.patch('/bulk-resolve', verifyToken, checkRole(['Admin']), attendanceController.bulkResolveLogs);

module.exports = router;