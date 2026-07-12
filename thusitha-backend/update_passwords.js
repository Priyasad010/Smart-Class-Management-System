const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'thusithaedu_db',
  password: process.env.DB_PASSWORD || 'new_password', // change according to your actual DB password
  port: process.env.DB_PORT || 5432,
});

async function updatePasswords() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    await pool.query('UPDATE users SET password_hash = $1', [hashedPassword]);
    console.log('All passwords updated to 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error updating passwords', error);
    process.exit(1);
  }
}

updatePasswords();
