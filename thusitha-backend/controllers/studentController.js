const db = require('../db');
const bcrypt = require('bcryptjs');
const path = require('node:path');

const auditService = require('../utils/auditService');
const { runAIProcess } = require('./attendanceController');

// 💡 Moodle Integration Placeholder
const createMoodleAccount = async (studentData) => {
  // In a real scenario, you would use axios to call Moodle's REST API here
  // function: core_user_create_users
  console.log(`🌐 [Moodle Sync] Creating account for ${studentData.username}...`);
  return true;
};

// 🛡️ Logic to pre-calculate face encoding for a student
exports.generateFaceEncoding = async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await db.pool.query('SELECT profile_photo_path FROM Students WHERE student_id = $1', [studentId]);
    const photoPath = result.rows[0]?.profile_photo_path;

    if (!photoPath) return res.status(400).json({ message: "ශිෂ්‍යයාට ඡායාරූපයක් එක් කර නැත." });

    const aiResult = await runAIProcess('encode', { image_path: path.resolve(photoPath) });
    
    await db.pool.query('UPDATE Students SET face_encoding = $1 WHERE student_id = $2', [JSON.stringify(aiResult.encoding), studentId]);
    
    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Student', studentId, 'Pre-calculated face encoding.');
    res.json({ message: 'මුහුණේ දත්ත (Encoding) සාර්ථකව ගණනය කළා!' });
  } catch (err) {
    console.error('Encoding Error:', err.message);
    res.status(500).json({ error: 'Encoding අසාර්ථකයි: ' + err.message });
  }
};

// 🛡️ Logic to pre-calculate face encodings for all students missing them
exports.bulkGenerateEncodings = async (req, res) => {
  try {
    const students = await db.pool.query(
      "SELECT student_id, profile_photo_path FROM Students WHERE profile_photo_path IS NOT NULL AND face_encoding IS NULL"
    );

    if (students.rows.length === 0) {
      return res.json({ message: 'Encoding සඳහා අලුත් ශිෂ්‍යයන් හමුවුනේ නැත.' });
    }

    let successCount = 0;
    let failCount = 0;

    for (const student of students.rows) {
      try {
        const aiResult = await runAIProcess('encode', { image_path: path.resolve(student.profile_photo_path) });
        if (aiResult.encoding) {
          await db.pool.query('UPDATE Students SET face_encoding = $1 WHERE student_id = $2', [JSON.stringify(aiResult.encoding), student.student_id]);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Encoding failed for student_id=${student.student_id}:`, err.message);
        failCount++;
      }
    }

    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Student', null, `Bulk encoded ${successCount} students.`);
    res.json({ message: `සාර්ථකයි! සිසුන් ${successCount} දෙනෙකුගේ දත්ත ගණනය කළා. අසාර්ථක: ${failCount}` });
  } catch (err) {
    res.status(500).json({ error: 'Bulk Encoding අසාර්ථකයි: ' + err.message });
  }
};

// Public Registration (Adds to a pending queue)
exports.publicRegistration = async (req, res) => {
  const { student_name, school, grade, parent_phone, email, course_id } = req.body;
  try {
    const query = `
      INSERT INTO PendingRegistrations (name, school, grade, phone, email, course_interest, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING id
    `;
    const result = await db.pool.query(query, [student_name, school, grade, parent_phone, email, course_id || null]);
    res.status(201).json({ message: 'ලියාපදිංචිය සාර්ථකයි! කරුණාකර අනුමැතිය සඳහා කාර්යාලයට පැමිණෙන්න.', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'දත්ත ඇතුළත් කිරීමේ දෝෂයකි.', details: err.message });
  }
};

// ලබා නොදුන් අනුමැතීන් සහිත සිසුන් ලැයිස්තුව ලබා ගැනීම
exports.getPendingRegistrations = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM PendingRegistrations WHERE status = $1 ORDER BY id DESC', ['Pending']);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Pending Registrations Error:', err.message);
    res.status(500).json({ error: 'දත්ත ලබා ගැනීමට නොහැකි විය.' });
  }
};

// Approve and Create Account (Counter Person Action)
exports.approveStudent = async (req, res) => {
  const { pending_id, qr_code_key, parent_id } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch pending data
    const pending = await client.query('SELECT * FROM PendingRegistrations WHERE id = $1', [pending_id]);
    if (pending.rows.length === 0) throw new Error('වාර්තාව හමුවුනේ නැත.');
    const s = pending.rows[0];

    // 2. Create System User
    const username = qr_code_key; // Using QR key as username ensures uniqueness for siblings sharing parent contact info
    const passwordHash = await bcrypt.hash('Thusitha@123', 10); // Default password
    const userRes = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [username, passwordHash, 'Student']
    );
    const userId = userRes.rows[0].user_id;

    // 3. Create Real Student Profile
    const studentRes = await client.query(
      'INSERT INTO Students (user_id, parent_id, student_name, school, grade, qr_code_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING student_id',
      [userId, parent_id || null, s.name, s.school, s.grade, qr_code_key]
    );

    // 4. Clean up pending table
    await client.query('DELETE FROM PendingRegistrations WHERE id = $1', [pending_id]);

    await client.query('COMMIT');

    // Post-processing
    await createMoodleAccount({ username, student_name: s.name });
    await auditService.logAction(req.user.userId, req.user.role, 'APPROVE', 'Student', studentRes.rows[0].student_id, `Approved registration for ${s.name}`);

    res.json({ message: 'ශිෂ්‍ය ගිණුම සාර්ථකව සක්‍රිය කරන ලදී!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

// ශිෂ්‍යයෙක් ලියාපදිංචි කිරීම
exports.registerStudent = async (req, res) => {
  const { username, password, student_name, school, grade, qr_code_key, parent_id } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userResult = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [username, passwordHash, 'Student']
    );
    const userId = userResult.rows[0].user_id;

    const studentResult = await client.query(
      'INSERT INTO Students (user_id, parent_id, student_name, school, grade, qr_code_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, parent_id || null, student_name, school, grade, qr_code_key]
    );

    await client.query('COMMIT');
    
    // Trigger Moodle Sync
    await createMoodleAccount({ username, student_name });

    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Student', studentResult.rows[0].student_id, `Registered new student: ${student_name} (User ID: ${userId})`);
    res.status(201).json({ message: 'Student registered successfully', student: studentResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Student Registration Error:', err.message);
    res.status(500).json({ error: 'Failed to register student', details: err.message });
  } finally {
    client.release();
  }
};

// ශිෂ්‍ය දත්ත යාවත්කාලීන කිරීම (Update)
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { student_name, school, grade } = req.body;

  try {
    const query = `
      UPDATE Students 
      SET student_name = $1, school = $2, grade = $3 
      WHERE student_id = $4 RETURNING *
    `;
    const result = await db.pool.query(query, [student_name, school, grade, id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'ශිෂ්‍යයා හමුවුනේ නැත.' });

    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Student', id, `Updated student details for ID: ${id}`);
    res.json({ message: 'දත්ත සාර්ථකව යාවත්කාලීන කළා!', student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ශිෂ්‍යයෙක් ඉවත් කිරීම (Delete)
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    // Get user_id first to delete from Users table too
    const userRes = await client.query('SELECT user_id FROM Students WHERE student_id = $1', [id]);
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].user_id;
      await client.query('DELETE FROM Students WHERE student_id = $1', [id]);
      await client.query('DELETE FROM Users WHERE user_id = $1', [userId]);
    }
    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'DELETE', 'Student', id, `Deleted student and associated user account ID: ${id}`);
    res.json({ message: 'ශිෂ්‍යයා පද්ධතියෙන් ඉවත් කළා.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

// ඩේටාබේස් එකෙන් සියලුම සිසුන් Dashboard එකට ලබා දීම
exports.getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.*, p.parent_name 
      FROM Students s 
      LEFT JOIN Parents p ON s.parent_id = p.parent_id 
      ORDER BY s.student_id DESC
    `;
    const result = await db.pool.query(query);
    const formattedStudents = result.rows.map(student => ({
      _id: student.student_id,
      studentId: student.student_id || `ST-${student.user_id}`,
      name: student.student_name || 'Unknown',
      email: student.school || 'N/A',
      parentName: student.parent_name || 'N/A',
      hasEncoding: !!student.face_encoding
    }));
    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error('❌ Get All Students Error:', error.message);
    res.status(500).json({ message: "සිසුන් ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};