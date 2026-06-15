const db = require('../db');
const bcrypt = require('bcryptjs');

const auditService = require('../utils/auditService');
exports.registerTeacher = async (req, res) => {
  const { username, password, teacher_name, phone, email, qualifications } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create the User record
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userResult = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [username, passwordHash, 'Teacher']
    );
    const userId = userResult.rows[0].user_id;

    // 2. Create the Teacher profile linked to user_id
    const teacherResult = await client.query(
      'INSERT INTO Teachers (user_id, teacher_name, phone, email, qualifications) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, teacher_name, phone, email, qualifications]
    );

    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Teacher', teacherResult.rows[0].teacher_id, `Registered new teacher: ${teacher_name} (User ID: ${userId})`);
    res.status(201).json({ message: 'Teacher registered successfully', teacher: teacherResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Teacher Registration Error:', err.message);
    res.status(500).json({ error: 'Failed to register teacher', details: err.message });
  } finally {
    client.release();
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM Teachers ORDER BY teacher_id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "ගුරුවරුන් ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};