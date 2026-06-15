const express = require('express');
const router = express.Router();
const classScheduleController = require('../controllers/classScheduleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require Admin role for class management
router.post('/schedule', verifyToken, checkRole(['Admin']), classScheduleController.createClassSchedule);
router.get('/schedules', verifyToken, checkRole(['Admin', 'Teacher', 'Student', 'Counter Person']), classScheduleController.getAllClassSchedules); // Students/Teachers might need to view
router.put('/schedule/:id', verifyToken, checkRole(['Admin']), classScheduleController.updateClassSchedule);
router.delete('/schedule/:id', verifyToken, checkRole(['Admin']), classScheduleController.deleteClassSchedule);

module.exports = router;