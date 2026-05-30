const path   = require('path');
const fs     = require('fs');
const QRCode = require('qrcode');

const studentModel = require('../models/studentModel');

// ─── Helper: build public URL ────────────────────────────────────────────────
const baseUrl = () => `http://localhost:${process.env.PORT || 5000}`;

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/students  — Register a new student
// ═══════════════════════════════════════════════════════════════════════════════
const registerStudent = async (req, res, next) => {
  try {
    const {
      first_name, last_name, date_of_birth, gender,
      email, phone, address, grade_class, enrollment_year,
      parent_name, parent_phone_number, parent_email,
    } = req.body;

    // ── Required field validation ────────────────────────────────────────────
    const missing = [];
    if (!first_name)          missing.push('first_name');
    if (!last_name)           missing.push('last_name');
    if (!date_of_birth)       missing.push('date_of_birth');
    if (!parent_name)         missing.push('parent_name');
    if (!parent_phone_number) missing.push('parent_phone_number');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // ── Auto-generate Student ID Code ────────────────────────────────────────
    const year           = new Date().getFullYear();
    const student_id_code = await studentModel.generateStudentIdCode(year);

    // ── Insert into DB ───────────────────────────────────────────────────────
    const student = await studentModel.createStudent({
      student_id_code,
      first_name, last_name, date_of_birth, gender,
      email, phone, address,
      grade_class,
      enrollment_year: enrollment_year || year,
      parent_name, parent_phone_number, parent_email,
    });

    // ── Auto-generate QR Code on registration ────────────────────────────────
    const qrDir      = path.join(__dirname, '..', 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrFileName = `qr-${student.id}-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);

    const qrPayload  = JSON.stringify({
      id:             student.id,
      student_id:     student.student_id_code,
      name:           `${student.first_name} ${student.last_name}`,
      grade:          student.grade_class,
    });

    await QRCode.toFile(qrFilePath, qrPayload, {
      type:           'png',
      width:          300,
      margin:         2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });

    const qr_code_url = `${baseUrl()}/uploads/qrcodes/${qrFileName}`;
    const updated     = await studentModel.updateQrCodeUrl(student.id, qr_code_url);

    return res.status(201).json({
      success: true,
      message: `Student registered successfully with ID: ${student_id_code}`,
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/students  — List all with optional filters
// ═══════════════════════════════════════════════════════════════════════════════
const getAllStudents = async (req, res, next) => {
  try {
    const { search, gender, is_active, grade_class, enrollment_year } = req.query;
    const students = await studentModel.findAllStudents({
      search, gender, is_active, grade_class, enrollment_year,
    });

    return res.status(200).json({
      success: true,
      count:   students.length,
      data:    students,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/students/:id  — Get single student
// ═══════════════════════════════════════════════════════════════════════════════
const getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/students/:id  — Update student profile
// ═══════════════════════════════════════════════════════════════════════════════
const updateStudent = async (req, res, next) => {
  try {
    const student = await studentModel.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await studentModel.updateStudentById(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Student profile updated.',
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/students/:id/status  — Toggle active/inactive
// ═══════════════════════════════════════════════════════════════════════════════
const toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await studentModel.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await studentModel.toggleStatus(req.params.id);
    return res.status(200).json({
      success: true,
      message: `Student is now ${updated.is_active ? 'Active' : 'Inactive'}.`,
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/students/:id/photo  — Upload profile photo
// ═══════════════════════════════════════════════════════════════════════════════
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const student = await studentModel.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Delete old photo if exists
    if (student.profile_photo_url) {
      const oldPath = path.join(
        __dirname, '..', 'uploads', 'photos',
        path.basename(student.profile_photo_url)
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photo_url = `${baseUrl()}/uploads/photos/${req.file.filename}`;
    const updated   = await studentModel.updatePhotoUrl(req.params.id, photo_url);

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/students/:id/qrcode  — Re-generate QR code
// ═══════════════════════════════════════════════════════════════════════════════
const generateQRCode = async (req, res, next) => {
  try {
    const student = await studentModel.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const qrDir      = path.join(__dirname, '..', 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrFileName = `qr-${student.id}-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);

    const qrPayload  = JSON.stringify({
      id:         student.id,
      student_id: student.student_id_code,
      name:       `${student.first_name} ${student.last_name}`,
      grade:      student.grade_class,
    });

    await QRCode.toFile(qrFilePath, qrPayload, {
      type:  'png',
      width: 300,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });

    const qr_code_url = `${baseUrl()}/uploads/qrcodes/${qrFileName}`;
    const updated     = await studentModel.updateQrCodeUrl(student.id, qr_code_url);

    return res.status(200).json({
      success:     true,
      message:     'QR code generated successfully.',
      qr_code_url: updated.qr_code_url,
      data:        updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
  uploadProfilePhoto,
  generateQRCode,
};
