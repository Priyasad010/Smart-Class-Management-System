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
    // Insert marks for student_id 90 (Ishadhi Upeksha) for exams 15 and 16
    await pool.query("INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES (90, 15, 95.00) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = 95.00");
    await pool.query("INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES (90, 16, 88.00) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = 88.00");
    console.log('Marks inserted successfully for Ishadhi Upeksha (ST10001)');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
