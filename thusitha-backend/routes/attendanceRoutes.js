const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Face Verification and CCTV Upload routes
router.post('/upload-cctv', verifyToken, checkRole(['Admin', 'Teacher']), upload.single('cctv_footage'), attendanceController.uploadCCTVFootage);
router.post('/verify-face', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), attendanceController.verifyFace);
router.post('/mark-fraud', verifyToken, checkRole(['Admin', 'Teacher']), attendanceController.markFraud);

// Protected routes for attendance management
router.post('/', verifyToken, checkRole(['Admin', 'Counter Person']), attendanceController.markAttendanceByQR);
router.post('/validate-zones', verifyToken, checkRole(['Admin']), attendanceController.validateAttendanceWithZones);
router.post('/validate-hall', verifyToken, checkRole(['Admin']), attendanceController.validateAttendanceWithZones);
router.post('/bulk-save', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher']), attendanceController.saveManualAttendance);
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

// -------------------------------------------------------------
// NEW MISSING ENDPOINTS ADDED IN PHASE 1
// -------------------------------------------------------------
router.post('/cctv-occupancy', verifyToken, checkRole(['Admin']), attendanceController.checkCCTVOccupancy);
router.get('/session/:id', verifyToken, checkRole(['Admin', 'Teacher']), attendanceController.getSessionAttendance);
router.get('/session/:id/live-status', verifyToken, checkRole(['Admin', 'Teacher']), attendanceController.getLiveStatus);
router.get('/reports/daily', verifyToken, checkRole(['Admin']), attendanceController.getDailyReports);
router.get('/reports/monthly', verifyToken, checkRole(['Admin']), attendanceController.getMonthlyReports);
router.put('/manual-correction/:logId', verifyToken, checkRole(['Admin', 'Teacher']), attendanceController.manualCorrection);
router.get('/logs/:courseId', verifyToken, checkRole(['Admin', 'Teacher', 'Counter Person']), attendanceController.getTodayLogsByCourse);
router.get('/master/:courseId', verifyToken, checkRole(['Admin', 'Teacher', 'Counter Person']), attendanceController.getTodayMasterByCourse);

module.exports = router;