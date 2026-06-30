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
    // 1. Convert backslashes to forward slashes first
    await pool.query("UPDATE Learning_Materials SET uploaded_file = replace(uploaded_file, '\\', '/')");
    
    // 2. Extract filename and prepend 'uploads/'
    await pool.query(`
      UPDATE Learning_Materials 
      SET uploaded_file = 'uploads/' || regexp_replace(uploaded_file, '^.*/uploads/', '')
      WHERE uploaded_file LIKE '%/uploads/%' OR uploaded_file LIKE 'uploads/%'
    `);
    
    console.log('Fixed Learning_Materials paths!');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
