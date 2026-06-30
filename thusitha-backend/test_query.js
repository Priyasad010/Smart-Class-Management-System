const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'thusithaedu_db',
});

async function run() {
  try {
    const teachers = await pool.query("SELECT * FROM Teachers WHERE teacher_name LIKE '%Sumeera%'");
    console.log('SUMEERA TEACHER:', teachers.rows);

    if (teachers.rows.length > 0) {
      const user = await pool.query("SELECT * FROM Users WHERE user_id = $1", [teachers.rows[0].user_id]);
      console.log('SUMEERA USER:', user.rows);

    const examId = '15';
    const studentId = 90;
    try {
      const res = await pool.query(`
        SELECT er.student_id, s.student_name, er.marks
        FROM Exam_Results er
        JOIN Students s ON er.student_id = s.student_id
        WHERE er.exam_id = $1 AND er.student_id = $2
        ORDER BY s.student_name ASC;
      `, [examId, studentId]);
      console.log('Query result:', res.rows);
    } catch(e) {
      console.error('QUERY ERROR:', e);
    }
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
