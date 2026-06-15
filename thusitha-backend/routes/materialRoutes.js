const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('node:path');

// Configure multer to store files in a specific folder with safe limits
const upload = multer({ 
	dest: path.join(__dirname, '..', 'uploads', 'materials'),
	limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

router.get('/:courseId', verifyToken, materialController.getCourseMaterials);
router.post('/upload', verifyToken, checkRole(['Admin', 'Teacher']), upload.single('file'), materialController.uploadMaterial);

module.exports = router;