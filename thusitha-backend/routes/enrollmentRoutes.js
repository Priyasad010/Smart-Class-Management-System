const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/enroll', verifyToken, checkRole(['Admin', 'Counter Staff']), enrollmentController.enrollStudent);
router.get('/course/:courseId', verifyToken, enrollmentController.getEnrollmentsByCourse);

module.exports = router;