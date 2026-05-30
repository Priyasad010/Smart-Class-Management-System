const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// ─── Subject Management Endpoints ───────────────────────────────────────────
router.post('/subjects', teacherController.createSubject);
router.get('/subjects', teacherController.getAllSubjects);

// ─── Teacher Directory Endpoints ─────────────────────────────────────────────
router.post('/', teacherController.registerTeacher);
router.get('/', teacherController.getAllTeachers);
router.put('/:id', teacherController.updateTeacher);
router.patch('/:id/status', teacherController.toggleTeacherStatus);

// ─── Mapping & Dashboard Endpoints ──────────────────────────────────────────
router.post('/assign-subject', teacherController.assignTeacherToSubject);
router.get('/:id/dashboard', teacherController.getTeacherDashboardData);

module.exports = router;
