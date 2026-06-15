const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, lecturerController.getAllLecturers);
router.post('/', verifyToken, checkRole(['Admin']), lecturerController.addLecturer);

module.exports = router;