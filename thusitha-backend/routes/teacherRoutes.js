const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, teacherController.getAllTeachers);
router.post('/register', verifyToken, checkRole(['Admin']), teacherController.registerTeacher);
router.put('/:id', verifyToken, checkRole(['Admin']), teacherController.updateTeacher);
router.delete('/:id', verifyToken, checkRole(['Admin']), teacherController.deleteTeacher);

module.exports = router;