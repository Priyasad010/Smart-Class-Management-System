const db = require('../db');
const auditService = require('../utils/auditService');

// Helper function to check for time conflicts
const checkConflict = async (client, { hall_id, lecturer_id, day_of_week, start_time, end_time, exclude_schedule_id = null }) => {
  const conflictQuery = `
    SELECT 
      cs.schedule_id,
      cs.class_name,
      h.hall_name,
      l.lecturer_name
    FROM Class_Schedules cs
    JOIN Halls h ON cs.hall_id = h.hall_id
    JOIN Lecturers l ON cs.lecturer_id = l.lecturer_id
    WHERE 
      ARRAY[cs.day_of_week] && $1::text[] -- Check for overlapping days
      AND (
        (cs.start_time < $3 AND cs.end_time > $2) OR -- New schedule starts before existing ends and ends after existing starts
        (cs.start_time >= $2 AND cs.start_time < $3) OR -- New schedule starts within existing
        (cs.end_time > $2 AND cs.end_time <= $3) -- New schedule ends within existing
      )
      AND (cs.hall_id = $4 OR cs.lecturer_id = $5)
      ${exclude_schedule_id ? `AND cs.schedule_id != ${exclude_schedule_id}` : ''}
    LIMIT 1;
  `;

  const conflictResult = await client.query(conflictQuery, [day_of_week, start_time, end_time, hall_id, lecturer_id]);
  return conflictResult.rows[0];
};

// Create a new class schedule
exports.createClassSchedule = async (req, res) => {
  const { course_id, subject_id, lecturer_id, hall_id, day_of_week, start_time, end_time, class_name, capacity } = req.body;

  if (!course_id || !subject_id || !lecturer_id || !hall_id || !day_of_week || !start_time || !end_time || !class_name || !capacity) {
    return res.status(400).json({ error: 'සියලුම ක්ෂේත්‍ර සම්පූර්ණ කරන්න.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 💡 Conflict Prevention Logic
    const conflict = await checkConflict(client, { hall_id, lecturer_id, day_of_week, start_time, end_time });
    if (conflict) {
      return res.status(409).json({ error: `කාලසටහන ගැටුමක් ඇත: ${conflict.class_name} (${conflict.lecturer_name} / ${conflict.hall_name})` });
    }

    const query = `
      INSERT INTO Class_Schedules (course_id, subject_id, lecturer_id, hall_id, day_of_week, start_time, end_time, class_name, capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
    const result = await client.query(query, [course_id, subject_id, lecturer_id, hall_id, day_of_week, start_time, end_time, class_name, capacity]);

    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Class_Schedule', result.rows[0].schedule_id, `Created class schedule: ${class_name}`);
    res.status(201).json({ message: 'පන්ති කාලසටහන සාර්ථකව නිර්මාණය කළා!', schedule: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Create Class Schedule Error:', err.message);
    res.status(500).json({ error: 'කාලසටහන නිර්මාණය කිරීම අසාර්ථකයි.' });
  } finally {
    client.release();
  }
};

// Get all class schedules with joined data
exports.getAllClassSchedules = async (req, res) => {
  try {
    const query = `
      SELECT 
        cs.schedule_id,
        cs.class_name,
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        cs.capacity,
        c.course_name,
        s.subject_name,
        l.lecturer_name,
        h.hall_name,
        cs.course_id, cs.subject_id, cs.lecturer_id, cs.hall_id
      FROM Class_Schedules cs
      JOIN Courses c ON cs.course_id = c.course_id
      JOIN Subjects s ON cs.subject_id = s.subject_id
      JOIN Lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN Halls h ON cs.hall_id = h.hall_id
      ORDER BY cs.day_of_week, cs.start_time ASC
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get All Class Schedules Error:', err.message);
    res.status(500).json({ error: 'කාලසටහන් දත්ත ලබා ගැනීමට නොහැකි විය.' });
  }
};

// Update a class schedule
exports.updateClassSchedule = async (req, res) => {
  const { id } = req.params;
  const { course_id, subject_id, lecturer_id, hall_id, day_of_week, start_time, end_time, class_name, capacity } = req.body;

  if (!course_id || !subject_id || !lecturer_id || !hall_id || !day_of_week || !start_time || !end_time || !class_name || !capacity) {
    return res.status(400).json({ error: 'සියලුම ක්ෂේත්‍ර සම්පූර්ණ කරන්න.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 💡 Conflict Prevention Logic (excluding current schedule)
    const conflict = await checkConflict(client, { hall_id, lecturer_id, day_of_week, start_time, end_time, exclude_schedule_id: id });
    if (conflict) {
      return res.status(409).json({ error: `කාලසටහන ගැටුමක් ඇත: ${conflict.class_name} (${conflict.lecturer_name} / ${conflict.hall_name})` });
    }

    const query = `
      UPDATE Class_Schedules SET course_id = $1, subject_id = $2, lecturer_id = $3, hall_id = $4, day_of_week = $5, start_time = $6, end_time = $7, class_name = $8, capacity = $9
      WHERE schedule_id = $10 RETURNING *
    `;
    const result = await client.query(query, [course_id, subject_id, lecturer_id, hall_id, day_of_week, start_time, end_time, class_name, capacity, id]);

    if (result.rows.length === 0) throw new Error('කාලසටහන හමුවුනේ නැත.');

    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Class_Schedule', id, `Updated class schedule: ${class_name}`);
    res.json({ message: 'පන්ති කාලසටහන සාර්ථකව යාවත්කාලීන කළා!', schedule: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Update Class Schedule Error:', err.message);
    res.status(500).json({ error: 'කාලසටහන යාවත්කාලීන කිරීම අසාර්ථකයි.' });
  } finally {
    client.release();
  }
};

// Delete a class schedule
exports.deleteClassSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query('DELETE FROM Class_Schedules WHERE schedule_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new Error('කාලසටහන හමුවුනේ නැත.');

    await auditService.logAction(req.user.userId, req.user.role, 'DELETE', 'Class_Schedule', id, `Deleted class schedule ID: ${id}`);
    res.json({ message: 'පන්ති කාලසටහන සාර්ථකව ඉවත් කළා!' });
  } catch (err) {
    console.error('❌ Delete Class Schedule Error:', err.message);
    res.status(500).json({ error: 'කාලසටහන ඉවත් කිරීම අසාර්ථකයි.' });
  }
};

// පුද්ගලීකරණය කළ කාලසටහන ලබා ගැනීම (For Teachers and Students)
exports.getPersonalizedSchedule = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  let query = '';
  let params = [userId];

  if (role === 'Teacher') {
    query = `
      SELECT cs.*, c.course_name, s.subject_name, h.hall_name
      FROM Class_Schedules cs
      JOIN Lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN Courses c ON cs.course_id = c.course_id
      JOIN Subjects s ON cs.subject_id = s.subject_id
      JOIN Halls h ON cs.hall_id = h.hall_id
      WHERE l.user_id = $1
      ORDER BY cs.day_of_week, cs.start_time;
    `;
  } else if (role === 'Student') {
    query = `
      SELECT cs.*, c.course_name, s.subject_name, h.hall_name, l.lecturer_name
      FROM Class_Schedules cs
      JOIN Course_Enrollments ce ON cs.course_id = ce.course_id
      JOIN Students st ON ce.student_id = st.student_id
      JOIN Courses c ON cs.course_id = c.course_id
      JOIN Subjects s ON cs.subject_id = s.subject_id
      JOIN Halls h ON cs.hall_id = h.hall_id
      JOIN Lecturers l ON cs.lecturer_id = l.lecturer_id
      WHERE st.user_id = $1 AND ce.enrollment_status = 'Enrolled'
      ORDER BY cs.day_of_week, cs.start_time;
    `;
  } else {
    return res.status(403).json({ error: 'අනවසර ප්‍රවේශයකි.' });
  }

  try {
    const result = await db.pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Personalized Schedule Error:', err.message);
    res.status(500).json({ error: 'කාලසටහන ලබා ගැනීමට නොහැකි විය.' });
  }
};