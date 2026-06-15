const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}); // Temporary storage

router.get('/course/:courseId', verifyToken, examController.getCourseExams);
router.post('/', verifyToken, checkRole(['Admin', 'Teacher']), examController.createExam);
router.post('/marks', verifyToken, checkRole(['Admin', 'Teacher']), examController.addMarks);
router.post('/upload-marks', verifyToken, checkRole(['Admin', 'Teacher']), upload.single('file'), examController.uploadExcelMarks);

module.exports = router;