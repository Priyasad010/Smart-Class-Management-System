const express = require('express');
const router = express.Router();
const studyAreaController = require('../controllers/studyAreaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/seats', verifyToken, studyAreaController.getAvailableSeats);
router.post('/book', verifyToken, studyAreaController.createBooking);
router.patch('/check-in/:bookingId', verifyToken, studyAreaController.checkIn);

module.exports = router;