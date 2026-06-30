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
    // Fix Course 20 (Sinhala Literature) -> Sumeera (teacher_id 18), O/L Sinhala Literature (subject_id 25)
    await pool.query('UPDATE Courses SET teacher_id = 18, subject_id = 25 WHERE course_id = 20');
    console.log('Fixed Course 20');

    // Fix Course 19 (A/L ICT) -> Namal Kumara (teacher_id 16), A/L ICT (subject_id 24)
    await pool.query('UPDATE Courses SET teacher_id = 16, subject_id = 24 WHERE course_id = 19');
    console.log('Fixed Course 19');

    // Fix Course 18 (A/L Geography) -> Sampath Dasanayake (teacher_id 17), Geography (subject_id 22)
    await pool.query('UPDATE Courses SET teacher_id = 17, subject_id = 22 WHERE course_id = 18');
    console.log('Fixed Course 18');

    // Fix Course 17 (Grade 5 Scholarship) -> Sunil Perera (teacher_id 2), Grade 5 Scholarship (subject_id 21)
    await pool.query('UPDATE Courses SET teacher_id = 2, subject_id = 21 WHERE course_id = 17');
    console.log('Fixed Course 17');

    console.log('All legacy courses fixed!');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
