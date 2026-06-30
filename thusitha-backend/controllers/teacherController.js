const db = require('../db');
const bcrypt = require('bcryptjs');

const auditService = require('../utils/auditService');
exports.registerTeacher = async (req, res) => {
  const { username, password, teacher_name, phone, email, qualifications, specialization, bio } = req.body;
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
      'INSERT INTO Teachers (user_id, teacher_name, phone, email, qualifications, specialization, bio) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, teacher_name, phone, email, qualifications, specialization, bio]
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

// ගුරුවරයෙක් යාවත්කාලීන කිරීම (Update)
exports.updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { teacher_name, phone, email, specialization, qualifications, bio } = req.body;
  try {
    const query = `
      UPDATE Teachers 
      SET teacher_name = $1, phone = $2, email = $3, specialization = $4, qualifications = $5, bio = $6
      WHERE teacher_id = $7 RETURNING *
    `;
    const result = await db.pool.query(query, [teacher_name, phone, email, specialization, qualifications, bio, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'ගුරුවරයා හමුවුනේ නැත.' });
    
    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Teacher', id, `Updated teacher details for ID: ${id}`);
    res.json({ message: 'ගුරු දත්ත සාර්ථකව යාවත්කාලීන කළා!', teacher: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ගුරුවරයෙක් ඉවත් කිරීම (Delete)
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT user_id FROM Teachers WHERE teacher_id = $1', [id]);
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].user_id;
      await client.query('DELETE FROM Teachers WHERE teacher_id = $1', [id]);
      await client.query('DELETE FROM Users WHERE user_id = $1', [userId]);
    }
    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'DELETE', 'Teacher', id, `Deleted teacher and associated user account ID: ${id}`);
    res.json({ message: 'ගුරුවරයා පද්ධතියෙන් ඉවත් කළා.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};