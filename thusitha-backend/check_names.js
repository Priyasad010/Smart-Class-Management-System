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
    const names = ['Ishadi Upeksha', 'Lasitha Priyasad', 'Anushka Umayanga'];
    const res = await pool.query("SELECT student_id, student_name, qr_code_key FROM Students WHERE LOWER(student_name) LIKE '%ishadi%'");
    console.log('Search results for Ishadi:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
