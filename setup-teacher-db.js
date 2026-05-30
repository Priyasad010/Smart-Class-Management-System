const pool = require('./db');

async function setupTeacherDatabase() {
  try {
    console.log('⏳ Creating teachers, subjects, and bridge tables...');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
          id              SERIAL PRIMARY KEY,
          teacher_id_code VARCHAR(50) UNIQUE NOT NULL,
          first_name      VARCHAR(100) NOT NULL,
          last_name       VARCHAR(100) NOT NULL,
          email           VARCHAR(100) UNIQUE NOT NULL,
          phone           VARCHAR(20) NOT NULL,
          qualification   TEXT,
          specialization  VARCHAR(100),
          is_active       BOOLEAN DEFAULT TRUE,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create trigger
    await pool.query(`
      CREATE OR REPLACE TRIGGER trg_teachers_updated_at
      BEFORE UPDATE ON teachers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create subjects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
          id              SERIAL PRIMARY KEY,
          subject_code    VARCHAR(50) UNIQUE NOT NULL,
          subject_name    VARCHAR(100) NOT NULL,
          grade           VARCHAR(20) NOT NULL,
          course_type     VARCHAR(50),
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create bridge table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teacher_subjects (
          id              SERIAL PRIMARY KEY,
          teacher_id      INT REFERENCES teachers(id) ON DELETE CASCADE,
          subject_id      INT REFERENCES subjects(id) ON DELETE CASCADE,
          assigned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(teacher_id, subject_id)
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id_code ON teachers(teacher_id_code);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_subjects_subject_code ON subjects(subject_code);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_teacher_subjects_mapping ON teacher_subjects(teacher_id, subject_id);`);

    console.log('✅ Teacher & Subject tables and indexes created successfully without data loss!');
  } catch (err) {
    console.error('❌ Error executing teacher schema additions:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

setupTeacherDatabase();
