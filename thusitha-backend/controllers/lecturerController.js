const db = require('../db');
const bcrypt = require('bcryptjs');
const auditService = require('../utils/auditService');

exports.addLecturer = async (req, res) => {
  const { lecturer_name, email, phone, specialization, bio, password } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create System User with Teacher role
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRes = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [email, passwordHash, 'Teacher']
    );
    const userId = userRes.rows[0].user_id;

    // 2. Create Lecturer Profile
    const query = `
      INSERT INTO Lecturers (user_id, lecturer_name, email, phone, specialization, bio)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const result = await client.query(query, [userId, lecturer_name, email, phone, specialization, bio]);

    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Lecturer', result.rows[0].lecturer_id, `Added new lecturer: ${lecturer_name}`);
    
    res.status(201).json({ message: 'දේශකයා සාර්ථකව පද්ධතියට එක් කළා!', lecturer: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getAllLecturers = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT teacher_id as lecturer_id, teacher_name as lecturer_name, email, phone, specialization, bio FROM Teachers ORDER BY teacher_name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};