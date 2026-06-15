const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, studentController.getAllStudents);

// Public Registration (No token required)
router.post('/register-public', studentController.publicRegistration);

// Approval and Management (Restricted)
router.post('/approve', verifyToken, checkRole(['Admin', 'Counter Staff']), studentController.approveStudent);
router.put('/:id', verifyToken, checkRole(['Admin']), studentController.updateStudent);
router.delete('/:id', verifyToken, checkRole(['Admin']), studentController.deleteStudent);

module.exports = router;