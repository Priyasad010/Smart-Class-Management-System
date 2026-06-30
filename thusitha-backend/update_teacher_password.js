const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'thusithaedu_db',
});

async function updatePassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Teacher@123', salt);
    
    await pool.query("UPDATE Users SET password_hash = $1 WHERE username = 'teacher'", [passwordHash]);
    console.log("Successfully updated password for 'teacher' to 'Teacher@123'");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
updatePassword();
