const express    = require('express');
const router     = express.Router();
const upload     = require('../middleware/upload');
const controller = require('../controllers/studentController');

// ─── Register a new student ──────────────────────────────────────────────────
router.post('/',                          controller.registerStudent);

// ─── Get all students (with optional filters/search) ────────────────────────
router.get('/',                           controller.getAllStudents);

// ─── Get a single student by DB id ──────────────────────────────────────────
router.get('/:id',                        controller.getStudentById);

// ─── Update student profile ──────────────────────────────────────────────────
router.put('/:id',                        controller.updateStudent);

// ─── Toggle active / inactive status ────────────────────────────────────────
router.patch('/:id/status',               controller.toggleStudentStatus);

// ─── Upload profile photo ────────────────────────────────────────────────────
router.post('/:id/photo', upload.single('photo'), controller.uploadProfilePhoto);

// ─── Generate / re-generate QR code ─────────────────────────────────────────
router.get('/:id/qrcode',                 controller.generateQRCode);

module.exports = router;
