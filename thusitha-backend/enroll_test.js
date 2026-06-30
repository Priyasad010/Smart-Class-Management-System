const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'thusithaedu_db',
});

async function testTimetable() {
  try {
    const teacherRes = await pool.query('SELECT user_id, teacher_id, teacher_name FROM Teachers LIMIT 1');
    if (teacherRes.rows.length === 0) return console.log('No teachers');
    const teacher = teacherRes.rows[0];
    
    const query = `
      SELECT cs.*, c.course_name, s.subject_name, h.hall_name, l.teacher_name as lecturer_name
      FROM Class_Schedules cs
      JOIN Courses c ON cs.course_id = c.course_id
      JOIN Teachers l ON c.teacher_id = l.teacher_id
      LEFT JOIN Subjects s ON c.subject_id = s.subject_id
      LEFT JOIN Halls h ON cs.hall_id = h.hall_id
      WHERE l.user_id = $1
      ORDER BY cs.day_of_week, cs.start_time;
    `;
    const res = await pool.query(query, [teacher.user_id]);
    console.log('Teacher timetable:', res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
testTimetable();
