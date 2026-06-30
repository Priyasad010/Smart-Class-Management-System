const express = require('express');
const router = express.Router();
const studyAreaController = require('../controllers/studyAreaController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for study area management
router.get('/seats', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.getAvailableSeats);
router.post('/book', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.createBooking);
router.patch('/check-in/:bookingId', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.checkIn);
router.post('/:bookingId/confirm-arrival', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.checkIn); // Alias for checkIn
router.post('/check-out/:bookingId', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.checkOut);

router.get('/:id/status', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.getBookingStatus);
router.get('/history/:studentId', verifyToken, checkRole(['Admin', 'Counter Person', 'Teacher', 'Student']), studyAreaController.getStudentHistory);

module.exports = router;