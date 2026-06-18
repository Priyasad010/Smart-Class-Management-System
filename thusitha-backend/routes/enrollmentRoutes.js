const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for enrollment management
router.post('/enroll', verifyToken, checkRole(['Admin', 'Counter Person']), enrollmentController.enrollStudent);
router.get('/course/:courseId', verifyToken, checkRole(['Admin', 'Teacher']), enrollmentController.getEnrollmentsByCourse);

module.exports = router;