const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public route to get all lecturers
router.get('/public', lecturerController.getAllLecturers);
// Protected route to get all lecturers (for dashboard)
router.get('/', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher']), lecturerController.getAllLecturers);
router.post('/', verifyToken, checkRole(['Admin']), lecturerController.addLecturer);
module.exports = router;