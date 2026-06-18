const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Assuming you have an upload middleware

// Protected routes for learning materials
router.post('/upload', verifyToken, checkRole(['Admin', 'Teacher']), upload.single('file'), materialController.uploadMaterial);
router.get('/:courseId', verifyToken, checkRole(['Admin', 'Teacher', 'Student']), materialController.getCourseMaterials);

module.exports = router;