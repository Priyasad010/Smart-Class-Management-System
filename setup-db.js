const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function setupDatabase() {
  try {
    console.log('🔄 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Running SQL schema queries on PostgreSQL...');
    await pool.query(sql);

    console.log('✅ Database tables created successfully!');
  } catch (err) {
    console.error('❌ Error executing schema:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

setupDatabase();
