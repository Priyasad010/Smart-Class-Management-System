const db = require('../db');
const bcrypt = require('bcryptjs');
const path = require('node:path');

const auditService = require('../utils/auditService');
const attendanceController = require('./attendanceController');

const moodleService = require('../utils/moodleService');

// 💡 Moodle Integration
const createMoodleAccount = async (studentData) => {
  try {
    console.log(`🌐 [Moodle Sync] Creating account for ${studentData.username}...`);
    const nameParts = studentData.student_name.split(' ');
    const firstname = nameParts[0] || studentData.username;
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Student';
    
    const studentForMoodle = {
      username: studentData.username,
      password: 'ChangeMe@123',
      firstname: firstname,
      lastname: lastname,
      email: `${studentData.username}@thusitha.edu.lk`
    };
    
    const response = await moodleService.createUser(studentForMoodle);
    console.log(`✅ [Moodle Sync] Account created successfully.`);
    if (response && response.length > 0 && response[0].id) {
      return response[0].id;
    }
    return true;
  } catch (error) {
    console.error(`❌ [Moodle Sync] Failed:`, error.message);
    return null; // Don't crash the main registration if Moodle is down
  }
};

// 🛡️ Logic to pre-calculate face encoding for a student
exports.generateFaceEncoding = async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await db.pool.query('SELECT profile_photo_path FROM Students WHERE student_id = $1', [studentId]);
    const photoPath = result.rows[0]?.profile_photo_path;

    if (!photoPath) return res.status(400).json({ message: "ශිෂ්‍යයාට ඡායාරූපයක් එක් කර නැත." });

    const aiResult = await attendanceController.runAIProcess('encode', { image_path: path.resolve(photoPath) });
    
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
        const aiResult = await attendanceController.runAIProcess('encode', { image_path: path.resolve(student.profile_photo_path) });
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
  const { student_name, school, grade, parent_phone, parent_name, email, course_id } = req.body;
  try {
    const query = `
      INSERT INTO PendingRegistrations (name, school, grade, phone, parent_name, email, course_interest, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING id
    `;
    const result = await db.pool.query(query, [student_name, school, grade, parent_phone, parent_name || null, email, course_id || null]);
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

    // 3. Resolve parent_id
    let finalParentId = parent_id || null;
    if (!finalParentId && s.phone) {
      const parent_phone = s.phone;
      const parent_name = s.parent_name || 'Parent';
      const existingParent = await client.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [parent_phone]);
      if (existingParent.rows.length > 0) {
        finalParentId = existingParent.rows[0].parent_id;
      } else {
        const parentPasswordHash = await bcrypt.hash('Thusitha@123', 10);
        const parentUserResult = await client.query(
          'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
          [`P-${parent_phone}`, parentPasswordHash, 'Parent']
        );
        const parentUserId = parentUserResult.rows[0].user_id;
        const parentResult = await client.query(
          'INSERT INTO Parents (user_id, parent_name, parent_phone) VALUES ($1, $2, $3) RETURNING parent_id',
          [parentUserId, parent_name, parent_phone]
        );
        finalParentId = parentResult.rows[0].parent_id;
      }
    }

    // 4. Create Real Student Profile
    const studentRes = await client.query(
      'INSERT INTO Students (user_id, parent_id, student_name, school, grade, qr_code_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING student_id',
      [userId, finalParentId, s.name, s.school, s.grade, qr_code_key]
    );

    // 4. Clean up pending table
    await client.query('DELETE FROM PendingRegistrations WHERE id = $1', [pending_id]);

    await client.query('COMMIT');

    // Post-processing
    const studentId = studentRes.rows[0].student_id;
    const moodleUserId = await createMoodleAccount({ username, student_name: s.name });
    let moodleMsg = "Moodle ගිණුම සෑදීමට නොහැකි විය.";
    if (moodleUserId && moodleUserId !== true) {
      moodleMsg = "Moodle ගිණුම සාර්ථකව සෑදුවා.";
      await db.pool.query('UPDATE Students SET moodle_user_id = $1 WHERE student_id = $2', [moodleUserId, studentId]);
      // Attempt auto-enrollment if a course was selected
      if (s.course_interest) {
        try {
          // Extract digits from course_interest if it's a string, or just use it if it's a number
          const match = s.course_interest.toString().match(/\d+/);
          const moodleCourseId = match ? parseInt(match[0], 10) : NaN;
          if (!isNaN(moodleCourseId)) {
            await moodleService.enrollUser(moodleUserId, moodleCourseId);
            console.log(`✅ [Moodle Sync] Auto-enrolled in course ${moodleCourseId}`);
            moodleMsg += " පාඨමාලාවට ඇතුළත් කළා.";
          }
        } catch (e) {
          console.error(`❌ [Moodle Sync] Auto-enrollment failed:`, e.message);
          moodleMsg += " පාඨමාලාවට ඇතුළත් කිරීමට නොහැකි විය.";
        }
      }
    }
    await auditService.logAction(req.user.userId, req.user.role, 'APPROVE', 'Student', studentId, `Approved registration for ${s.name}`);

    res.json({ message: `ශිෂ්‍යයා ලියාපදිංචිය සාර්ථකයි! ${moodleMsg}` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

// ශිෂ්‍යයෙක් ලියාපදිංචි කිරීම
exports.registerStudent = async (req, res) => {
  const { username, password, student_name, school, grade, qr_code_key, parent_id, parent_name, parent_phone } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Resolve parent_id
    let finalParentId = parent_id || null;
    if (!finalParentId && parent_name && parent_phone) {
      const existingParent = await client.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [parent_phone]);
      if (existingParent.rows.length > 0) {
        finalParentId = existingParent.rows[0].parent_id;
      } else {
        const parentUserResult = await client.query(
          'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
          [`P-${parent_phone}`, passwordHash, 'Parent']
        );
        const parentUserId = parentUserResult.rows[0].user_id;
        const parentResult = await client.query(
          'INSERT INTO Parents (user_id, parent_name, parent_phone) VALUES ($1, $2, $3) RETURNING parent_id',
          [parentUserId, parent_name, parent_phone]
        );
        finalParentId = parentResult.rows[0].parent_id;
      }
    }

    const userResult = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [username, passwordHash, 'Student']
    );
    const userId = userResult.rows[0].user_id;

    const studentResult = await client.query(
      'INSERT INTO Students (user_id, parent_id, student_name, school, grade, qr_code_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, finalParentId, student_name, school, grade, qr_code_key]
    );

    await client.query('COMMIT');
    
    // Trigger Moodle Sync
    const studentId = studentResult.rows[0].student_id;
    const moodleUserId = await createMoodleAccount({ username, student_name });
    let moodleMsg = "Moodle ගිණුම සෑදීමට නොහැකි විය.";
    if (moodleUserId && moodleUserId !== true) {
      await db.pool.query('UPDATE Students SET moodle_user_id = $1 WHERE student_id = $2', [moodleUserId, studentId]);
      moodleMsg = "Moodle ගිණුම සාර්ථකව සෑදුවා.";
    }

    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Student', studentId, `Registered new student: ${student_name} (User ID: ${userId})`);
    res.status(201).json({ message: `ශිෂ්‍යයා ලියාපදිංචි කිරීම සාර්ථකයි! ${moodleMsg}`, student: studentResult.rows[0] });
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
  const { student_name, school, grade, parent_name, parent_phone } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const query = `
      UPDATE Students 
      SET student_name = $1, school = $2, grade = $3 
      WHERE student_id = $4 RETURNING *
    `;
    const result = await client.query(query, [student_name, school, grade, id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'ශිෂ්‍යයා සොයාගත නොහැකි විය.' });
    }

    if (result.rows[0].parent_id) {
      const currentParentId = result.rows[0].parent_id;
      let finalParentId = currentParentId;
      
      if (parent_phone) {
        // Check if phone already exists
        const existRes = await client.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [parent_phone]);
        if (existRes.rows.length > 0) {
          const existId = existRes.rows[0].parent_id;
          if (existId !== currentParentId) {
            // It's a different parent! Re-link student to this parent (sibling logic)
            finalParentId = existId;
            await client.query('UPDATE Students SET parent_id = $1 WHERE student_id = $2', [finalParentId, id]);
            // If parent_name was also provided, update the existing parent's name
            if (parent_name) {
              await client.query('UPDATE Parents SET parent_name = $1 WHERE parent_id = $2', [parent_name, finalParentId]);
            }
          } else {
            // Same parent, just update name
            if (parent_name) {
              await client.query('UPDATE Parents SET parent_name = $1 WHERE parent_id = $2', [parent_name, finalParentId]);
            }
          }
        } else {
          // Phone does not exist, safe to update current parent
          if (parent_name) {
            await client.query('UPDATE Parents SET parent_name = $1, parent_phone = $2 WHERE parent_id = $3', [parent_name, parent_phone, currentParentId]);
          } else {
            await client.query('UPDATE Parents SET parent_phone = $1 WHERE parent_id = $2', [parent_phone, currentParentId]);
          }
        }
      } else if (parent_name) {
        await client.query('UPDATE Parents SET parent_name = $1 WHERE parent_id = $2', [parent_name, currentParentId]);
      }
    }
    
    await client.query('COMMIT');

    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Student', id, `Updated student details for ID: ${id}`);
    res.json({ message: 'දත්ත සාර්ථකව යාවත්කාලීන කරන ලදී!', student: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505' && err.constraint === 'parents_parent_phone_key') {
      return res.status(400).json({ error: 'මෙම දුරකථන අංකය දැනටමත් වෙනත් මව්පියෙකු සඳහා භාවිතා කර ඇත.' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
    let query = '';
    let params = [];
    if (req.user && req.user.role === 'Teacher') {
      // Teacher: Only see students enrolled in their courses
      query = `
        SELECT DISTINCT s.*, p.parent_name, p.parent_phone 
        FROM Students s 
        LEFT JOIN Parents p ON s.parent_id = p.parent_id 
        JOIN Course_Enrollments ce ON s.student_id = ce.student_id
        JOIN Courses c ON ce.course_id = c.course_id
        JOIN Teachers t ON c.teacher_id = t.teacher_id
        WHERE t.user_id = $1 AND ce.enrollment_status IN ('Enrolled', 'Active')
        ORDER BY s.student_id DESC
      `;
      params = [req.user.userId];
    } else {
      // Admin/Counter Person: See all students
      query = `
        SELECT s.*, p.parent_name, p.parent_phone 
        FROM Students s 
        LEFT JOIN Parents p ON s.parent_id = p.parent_id 
        ORDER BY s.student_id DESC
      `;
    }
    const result = await db.pool.query(query, params);
    const formattedStudents = result.rows.map(student => ({
      _id: student.student_id,
      studentId: student.qr_code_key || `ST-${student.user_id}`,
      name: student.student_name || 'Unknown',
      email: student.school || 'N/A',
      parentName: student.parent_name || 'N/A',
      parentPhone: student.parent_phone || 'N/A',
      hasEncoding: !!student.face_encoding,
      hasPhoto: !!student.profile_photo_path,
      photoPath: student.profile_photo_path
    }));
    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error('❌ Get All Students Error:', error.message);
    res.status(500).json({ message: "සිසුන් ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};

// 📸 Upload profile photo
exports.uploadPhoto = async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "ඡායාරූපයක් තෝරා නැත." });
  }
  
  if (!id || isNaN(parseInt(id))) {
     return res.status(400).json({ message: "වලංගු නොවන ශිෂ්‍ය හැඳුනුම්පතකි (Invalid Student ID)." });
  }

  const photoPath = `uploads/${req.file.filename}`;
  try {
    const result = await db.pool.query(
      'UPDATE Students SET profile_photo_path = $1, face_encoding = NULL WHERE student_id = $2 RETURNING *',
      [photoPath, parseInt(id, 10)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ශිෂ්‍යයා සොයාගත නොහැකි විය." });
    }
    await auditService.logAction(req.user?.userId || 0, req.user?.role || 'System', 'UPDATE', 'Student', id, `Uploaded profile photo: ${photoPath}`);
    res.json({ message: "ඡායාරූපය සාර්ථකව යාවත්කාලීන කළා!", photo_path: photoPath });
  } catch (err) {
    console.error('❌ Photo Upload Error:', err.message, err.stack);
    res.status(500).json({ error: "සේවාදායකයේ දෝෂයකි (Internal Server Error)." });
  }
};