const express = require('express');
const router = express.Router();
const qrCtrl = require('../controllers/qrAttendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ── Admin / Counter Person routes ────────────────────────────────────────────
// Create a new QR attendance session
router.post(
  '/sessions',
  verifyToken,
  checkRole(['Admin', 'Counter Person']),
  qrCtrl.createSession
);

// Get session details (with auto-expire check)
router.get(
  '/sessions/:id',
  verifyToken,
  checkRole(['Admin', 'Counter Person']),
  qrCtrl.getSession
);

// Get full enrolled student attendance list for a session
router.get(
  '/sessions/:id/attendance',
  verifyToken,
  checkRole(['Admin', 'Counter Person']),
  qrCtrl.getSessionAttendanceList
);

// Stop a QR session
router.patch(
  '/sessions/:id/stop',
  verifyToken,
  checkRole(['Admin', 'Counter Person']),
  qrCtrl.stopSession
);

// Get today's active/latest session for a specific course
router.get(
  '/sessions/active/:courseId',
  verifyToken,
  checkRole(['Admin', 'Counter Person']),
  qrCtrl.getActiveSessionByCourse
);

// ── Student route ────────────────────────────────────────────────────────────
// Auto-mark attendance (identity comes from JWT, NOT from body)
router.post(
  '/mark',
  verifyToken,
  checkRole(['Student']),
  qrCtrl.markAttendance
);

// ── Public QR validation (no auth — checks validity before login redirect) ───
router.get(
  '/verify/:sessionId',
  qrCtrl.verifyQR
);

module.exports = router;
