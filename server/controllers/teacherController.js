const pool = require('../../db');

/**
 * Register a new teacher and auto-generate Teacher ID (TCH-2026-XXXX)
 */
exports.registerTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, qualification, specialization } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and phone number are required.'
      });
    }

    // Auto-generate ID Code
    const countResult = await pool.query('SELECT COUNT(*) FROM teachers');
    const nextNum = parseInt(countResult.rows[0].count, 10) + 1;
    const teacherIdCode = `TCH-2026-${String(nextNum).padStart(4, '0')}`;

    const insertQuery = `
      INSERT INTO teachers (teacher_id_code, first_name, last_name, email, phone, qualification, specialization)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [teacherIdCode, firstName, lastName, email, phone, qualification || null, specialization || null];
    const result = await pool.query(insertQuery, values);

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation (email)
      return res.status(400).json({
        success: false,
        message: 'A teacher with this email address already exists.'
      });
    }
    next(err);
  }
};

/**
 * Fetch all teachers with search and status filters
 */
exports.getAllTeachers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT 
        t.id,
        t.teacher_id_code,
        t.first_name,
        t.last_name,
        t.email,
        t.phone,
        t.qualification,
        t.specialization,
        t.is_active,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'subject_code', s.subject_code, 'subject_name', s.subject_name)
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS assigned_subjects
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.first_name ILIKE $${params.length} OR t.last_name ILIKE $${params.length} OR t.specialization ILIKE $${params.length} OR t.teacher_id_code ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status === 'active');
      query += ` AND t.is_active = $${params.length}`;
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Teachers fetched successfully.',
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Update teacher details
 */
exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, qualification, specialization } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and phone number are required.'
      });
    }

    const updateQuery = `
      UPDATE teachers
      SET first_name = $1, last_name = $2, email = $3, phone = $4, qualification = $5, specialization = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const values = [firstName, lastName, email, phone, qualification || null, specialization || null, id];
    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Teacher profile updated successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle teacher status (Active/Inactive)
 */
exports.toggleTeacherStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updateQuery = `
      UPDATE teachers
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [isActive, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher status updated to ${isActive ? 'Active' : 'Inactive'} successfully.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper to register a new institutional subject
 */
exports.createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, grade, courseType } = req.body;

    if (!subjectCode || !subjectName || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, and grade are required.'
      });
    }

    const insertQuery = `
      INSERT INTO subjects (subject_code, subject_name, grade, course_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [subjectCode, subjectName, grade, courseType || 'O/L']);

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A subject with this subject code already exists.'
      });
    }
    next(err);
  }
};

/**
 * Fetch all subjects
 */
exports.getAllSubjects = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM subjects ORDER BY grade ASC, subject_name ASC';
    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      message: 'Subjects fetched successfully.',
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Assign a teacher to a subject
 */
exports.assignTeacherToSubject = async (req, res, next) => {
  try {
    const { teacherId, subjectId } = req.body;

    if (!teacherId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and Subject ID are required.'
      });
    }

    const insertQuery = `
      INSERT INTO teacher_subjects (teacher_id, subject_id)
      VALUES ($1, $2)
      ON CONFLICT (teacher_id, subject_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [teacherId, subjectId]);

    return res.status(200).json({
      success: true,
      message: 'Teacher assigned to subject successfully.',
      data: result.rows[0] || null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch a teacher's dashboard analytics: their profile details and assigned subjects list
 */
exports.getTeacherDashboardData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch teacher profile info
    const teacherResult = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
    if (teacherResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found.'
      });
    }

    // Fetch assigned subjects
    const subjectsQuery = `
      SELECT s.*
      FROM subjects s
      JOIN teacher_subjects ts ON s.id = ts.subject_id
      WHERE ts.teacher_id = $1;
    `;
    const subjectsResult = await pool.query(subjectsQuery, [id]);

    return res.status(200).json({
      success: true,
      message: 'Teacher dashboard details loaded.',
      data: {
        teacher: teacherResult.rows[0],
        subjects: subjectsResult.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};
