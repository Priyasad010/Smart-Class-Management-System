const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'thusithaedu_db',
});

async function findTeacher() {
  try {
    const res = await pool.query(`
      SELECT u.username, t.teacher_name 
      FROM Teachers t 
      JOIN Users u ON t.user_id = u.user_id 
      WHERE t.teacher_name LIKE '%Thusitha%' 
      LIMIT 1
    `);
    console.log('Teacher details:', res.rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
findTeacher();
