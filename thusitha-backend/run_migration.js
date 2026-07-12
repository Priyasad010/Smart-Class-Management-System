const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({user: 'postgres', host: 'localhost', database: 'thusithaedu_db', password: '1234', port: 5432});
const sql = fs.readFileSync(path.join(__dirname, '../database/migration_2026_06_19_promotions_teacher_profile_photo.sql'), 'utf8');

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Migration failed:', err);
  } else {
    console.log('Migration successful!');
  }
  pool.end();
});
