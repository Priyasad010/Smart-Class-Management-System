const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middleware/authMiddleware');

// සියලුම පන්ති ලබා ගැනීම (Get all courses)
router.get('/', verifyToken, courseController.getAllCourses);

module.exports = router;