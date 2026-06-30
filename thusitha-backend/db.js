const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Add listeners to know when the database is working
pool.on('connect', () => {
  console.log('✅ Database Connection Pool established');
});

// Immediate connection test to diagnose ECONNREFUSED on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed on startup:', err.message);
    process.exit(1); // Exit the application if initial connection fails
  } else {
    console.log('🚀 Database is reachable at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};