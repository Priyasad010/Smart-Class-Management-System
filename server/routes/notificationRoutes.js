const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ─── Notification Endpoint Routes ──────────────────────────────────────────

// POST /api/notifications/manual
router.post('/manual', notificationController.sendManualSMS);

// POST /api/notifications/bulk
router.post('/bulk', notificationController.sendBulkAnnouncement);

// GET /api/notifications/logs
router.get('/logs', notificationController.getSMSLogs);

// DELETE /api/notifications/purge
router.delete('/purge', notificationController.purgeSMSLogs);

module.exports = router;
