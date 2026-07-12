const db = require('./db.js');

async function run() {
  try {
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS Announcements (
          announcement_id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
          posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Announcements table created');

    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS Student_Achievements (
          achievement_id SERIAL PRIMARY KEY,
          student_id INT REFERENCES Students(student_id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          island_rank INT,
          achieved_year INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Student_Achievements table created');
  } catch (e) {
    console.error(e);
  } finally {
    db.pool.end();
  }
}
run();
