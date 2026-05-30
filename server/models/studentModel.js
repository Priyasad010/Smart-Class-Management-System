const pool = require('../../db');

// ─── Auto-generate Student ID Code ─────────────────────────────────────────
const generateStudentIdCode = async (year) => {
  const result = await pool.query(
    `SELECT student_id_code FROM students
     WHERE student_id_code LIKE $1
     ORDER BY student_id_code DESC
     LIMIT 1`,
    [`STU-${year}-%`]
  );

  if (result.rows.length === 0) {
    return `STU-${year}-0001`;
  }

  const last = result.rows[0].student_id_code;          // e.g. STU-2026-0042
  const seq  = parseInt(last.split('-')[2], 10) + 1;    // 43
  return `STU-${year}-${String(seq).padStart(4, '0')}`;
};

// ─── Create Student ─────────────────────────────────────────────────────────
const createStudent = async (data) => {
  const {
    student_id_code, first_name, last_name, date_of_birth, gender,
    email, phone, address, grade_class, enrollment_year,
    parent_name, parent_phone_number, parent_email,
  } = data;

  const result = await pool.query(
    `INSERT INTO students
       (student_id_code, first_name, last_name, date_of_birth, gender,
        email, phone, address, grade_class, enrollment_year,
        parent_name, parent_phone_number, parent_email)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      student_id_code, first_name, last_name, date_of_birth, gender,
      email, phone, address, grade_class, enrollment_year,
      parent_name, parent_phone_number, parent_email,
    ]
  );
  return result.rows[0];
};

// ─── Find All Students (with filters) ───────────────────────────────────────
const findAllStudents = async (filters = {}) => {
  const { search, gender, is_active, grade_class, enrollment_year } = filters;

  const conditions = [];
  const values     = [];
  let   idx        = 1;

  if (search) {
    conditions.push(
      `(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR student_id_code ILIKE $${idx})`
    );
    values.push(`%${search}%`);
    idx++;
  }

  if (gender) {
    conditions.push(`gender = $${idx}`);
    values.push(gender);
    idx++;
  }

  if (is_active !== undefined && is_active !== '') {
    conditions.push(`is_active = $${idx}`);
    values.push(is_active === 'true' || is_active === true);
    idx++;
  }

  if (grade_class) {
    conditions.push(`grade_class ILIKE $${idx}`);
    values.push(`%${grade_class}%`);
    idx++;
  }

  if (enrollment_year) {
    conditions.push(`enrollment_year = $${idx}`);
    values.push(parseInt(enrollment_year));
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT * FROM students ${where} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
};

// ─── Find Student By ID ──────────────────────────────────────────────────────
const findStudentById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM students WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

// ─── Update Student ──────────────────────────────────────────────────────────
const updateStudentById = async (id, data) => {
  const fields  = [];
  const values  = [];
  let   idx     = 1;

  const allowed = [
    'first_name', 'last_name', 'date_of_birth', 'gender', 'email',
    'phone', 'address', 'grade_class', 'enrollment_year',
    'parent_name', 'parent_phone_number', 'parent_email',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (fields.length === 0) return findStudentById(id);

  values.push(id);
  const result = await pool.query(
    `UPDATE students SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

// ─── Toggle Active Status ────────────────────────────────────────────────────
const toggleStatus = async (id) => {
  const result = await pool.query(
    `UPDATE students SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// ─── Update Profile Photo URL ────────────────────────────────────────────────
const updatePhotoUrl = async (id, url) => {
  const result = await pool.query(
    `UPDATE students SET profile_photo_url = $1 WHERE id = $2 RETURNING *`,
    [url, id]
  );
  return result.rows[0];
};

// ─── Update QR Code URL ──────────────────────────────────────────────────────
const updateQrCodeUrl = async (id, url) => {
  const result = await pool.query(
    `UPDATE students SET qr_code_url = $1 WHERE id = $2 RETURNING *`,
    [url, id]
  );
  return result.rows[0];
};

module.exports = {
  generateStudentIdCode,
  createStudent,
  findAllStudents,
  findStudentById,
  updateStudentById,
  toggleStatus,
  updatePhotoUrl,
  updateQrCodeUrl,
};
