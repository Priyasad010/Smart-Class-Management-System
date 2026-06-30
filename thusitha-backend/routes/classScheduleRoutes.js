const express = require('express');
const router = express.Router();
const classScheduleController = require('../controllers/classScheduleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for class schedules
router.get('/schedules', verifyToken, checkRole(['Admin', 'Teacher', 'Counter Person']), classScheduleController.getAllClassSchedules);
router.post('/schedule', verifyToken, checkRole(['Admin']), classScheduleController.createClassSchedule);
router.put('/schedule/:id', verifyToken, checkRole(['Admin']), classScheduleController.updateClassSchedule);
router.delete('/schedule/:id', verifyToken, checkRole(['Admin']), classScheduleController.deleteClassSchedule);

// Personalized timetable for teachers and students
router.get('/my-timetable', verifyToken, checkRole(['Teacher', 'Student']), classScheduleController.getPersonalizedSchedule);
module.exports = router;