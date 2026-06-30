const db = require('./db.js');

async function run() {
  try {
    console.log('Migrating Payments table...');
    
    // Add confirmation_url column
    await db.pool.query(`
      ALTER TABLE Payments 
      ADD COLUMN IF NOT EXISTS confirmation_url VARCHAR(255);
    `);
    console.log('confirmation_url column added/verified');

    // Add verification_comments column
    await db.pool.query(`
      ALTER TABLE Payments 
      ADD COLUMN IF NOT EXISTS verification_comments TEXT;
    `);
    console.log('verification_comments column added/verified');
    
    console.log('Migration complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    db.pool.end();
  }
}
run();
