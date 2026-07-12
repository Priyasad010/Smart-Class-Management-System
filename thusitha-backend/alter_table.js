const db = require('./db');

async function run() {
  try {
    console.log('Altering Students table to add address column...');
    await db.query('ALTER TABLE Students ADD COLUMN IF NOT EXISTS address TEXT;');
    console.log('✅ Alter table executed successfully.');
  } catch (err) {
    console.error('❌ Error executing alter table:', err.message);
  } finally {
    await db.pool.end();
  }
}

run();
