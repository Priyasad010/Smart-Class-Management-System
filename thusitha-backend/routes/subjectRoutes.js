const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for subjects
router.get('/', verifyToken, checkRole(['Admin', 'Teacher']), subjectController.getAllSubjects);
router.post('/', verifyToken, checkRole(['Admin']), subjectController.createSubject);
router.put('/:id', verifyToken, checkRole(['Admin']), subjectController.updateSubject);
router.delete('/:id', verifyToken, checkRole(['Admin']), subjectController.deleteSubject);

module.exports = router;