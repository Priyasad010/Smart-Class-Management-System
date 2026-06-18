const express = require('express');
const router = express.Router();
const studyAreaController = require('../controllers/studyAreaController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for study area management
router.get('/seats', verifyToken, checkRole(['Admin', 'Counter Person']), studyAreaController.getAvailableSeats);
router.post('/book', verifyToken, checkRole(['Admin', 'Counter Person']), studyAreaController.createBooking);
router.patch('/check-in/:bookingId', verifyToken, checkRole(['Admin', 'Counter Person']), studyAreaController.checkIn);
router.post('/check-out/:bookingId', verifyToken, checkRole(['Admin', 'Counter Person']), studyAreaController.checkOut); // Changed to POST as it modifies state

module.exports = router;