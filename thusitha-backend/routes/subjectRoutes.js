const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, subjectController.getAllSubjects);
router.post('/', verifyToken, checkRole(['Admin']), subjectController.createSubject);

module.exports = router;