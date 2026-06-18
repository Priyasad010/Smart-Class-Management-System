const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for attendance management
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), attendanceController.markAttendanceByQR); // Assuming this is the main attendance marking route
router.post('/validate-zones', verifyToken, checkRole(['Admin']), attendanceController.validateAttendanceWithZones);
router.get('/suspicious-logs', verifyToken, checkRole(['Admin']), attendanceController.getSuspiciousLogs);
router.patch('/resolve-log/:logId', verifyToken, checkRole(['Admin']), attendanceController.resolveLog);
router.patch('/bulk-resolve', verifyToken, checkRole(['Admin']), attendanceController.bulkResolveLogs);
router.get('/total-suspicious', verifyToken, checkRole(['Admin']), attendanceController.getTotalSuspiciousIncidents);
router.get('/health-stats', verifyToken, checkRole(['Admin']), attendanceController.getAIHealthStats);

// Study Area Occupancy
router.get('/occupancy-stats', verifyToken, checkRole(['Admin']), attendanceController.getLibraryOccupancyStats);

// Discrepancy Alerts
router.post('/discrepancy-alert', verifyToken, checkRole(['Admin']), attendanceController.sendDiscrepancyAlert);
router.post('/bulk-discrepancy-alert', verifyToken, checkRole(['Admin']), attendanceController.bulkSendDiscrepancyAlerts);
router.post('/safety-drill', verifyToken, checkRole(['Admin']), attendanceController.triggerSafetyDrill);

module.exports = router;