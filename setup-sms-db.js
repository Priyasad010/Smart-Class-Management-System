const pool = require('./db');

async function setupSmsTable() {
  try {
    console.log('🔄 Checking and creating sms_logs table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sms_logs (
          id            SERIAL PRIMARY KEY,
          student_id    INT REFERENCES students(id) ON DELETE CASCADE,
          parent_phone  VARCHAR(20) NOT NULL,
          message       TEXT NOT NULL,
          type          VARCHAR(50),
          status        VARCHAR(20),
          sent_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndex1 = `CREATE INDEX IF NOT EXISTS idx_sms_logs_student_id ON sms_logs(student_id);`;
    const createIndex2 = `CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);`;

    await pool.query(createTableQuery);
    await pool.query(createIndex1);
    await pool.query(createIndex2);

    console.log('✅ sms_logs table and indexes checked/created successfully!');
  } catch (err) {
    console.error('❌ Error executing database script:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

setupSmsTable();
