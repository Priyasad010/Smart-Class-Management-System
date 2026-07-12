/**
 * Moodle Bulk Sync Script
 * SCMS හි ඇති සියලු Students + Teachers Moodle වෙත Sync කරයි.
 * Run: node sync_users_to_moodle.js
 */

const db = require('./db');
const moodleService = require('./utils/moodleService');

async function syncAllUsers() {
  console.log('🚀 Moodle Bulk User Sync ආරම්භ කෙරෙයි...\n');

  // ---- Students ----
  const studentsResult = await db.pool.query(
    `SELECT s.student_id, s.student_name, u.email, u.username 
     FROM Students s 
     JOIN Users u ON s.user_id = u.user_id
     WHERE u.username IS NOT NULL AND u.role = 'Student'`
  );
  console.log(`📋 ශිෂ්‍යයන් සංඛ්‍යාව: ${studentsResult.rows.length}`);

  let studentsOk = 0, studentsFail = 0;
  for (const s of studentsResult.rows) {
    try {
      const nameParts = (s.student_name || s.username).split(' ');
      const firstname = nameParts[0] || s.username;
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Student';
      const moodleUsername = s.username.toLowerCase().replace(/[^a-z0-9]/g, '');

      await moodleService.createUser({
        username: moodleUsername,
        password: 'ChangeMe@123',
        firstname,
        lastname,
        email: s.student_email || `${moodleUsername}@thusitha.edu.lk`
      });
      console.log(`  ✅ Student: ${s.username} (${s.student_name})`);
      studentsOk++;
    } catch (err) {
      // "Username already exists" is OK - user already synced
      if (err.message && err.message.toLowerCase().includes('already')) {
        console.log(`  ⚠️  Student: ${s.username} — දැනටමත් Moodle හි ඇත.`);
        studentsOk++;
      } else {
        console.error(`  ❌ Student: ${s.username} — ${err.message}`);
        studentsFail++;
      }
    }
  }

  console.log(`\n📋 ශිෂ්‍ය Sync ප්‍රතිඵලය: ✅ ${studentsOk} සාර්ථක, ❌ ${studentsFail} අසාර්ථක\n`);

  // ---- Teachers ----
  const teachersResult = await db.pool.query(
    `SELECT t.teacher_id, t.teacher_name, t.email, u.username
     FROM Teachers t
     JOIN Users u ON t.user_id = u.user_id
     WHERE u.username IS NOT NULL AND u.role = 'Teacher'`
  );
  console.log(`📋 ගුරුවරු සංඛ්‍යාව: ${teachersResult.rows.length}`);

  let teachersOk = 0, teachersFail = 0;
  for (const t of teachersResult.rows) {
    try {
      const nameParts = (t.teacher_name || t.username).split(' ');
      const firstname = nameParts[0] || t.username;
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Teacher';
      const moodleUsername = t.username.toLowerCase().replace(/[^a-z0-9]/g, '');

      await moodleService.createUser({
        username: moodleUsername,
        password: 'ChangeMe@123',
        firstname,
        lastname,
        email: t.email || `${moodleUsername}@thusitha.edu.lk`
      });
      console.log(`  ✅ Teacher: ${t.username} (${t.teacher_name})`);
      teachersOk++;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        console.log(`  ⚠️  Teacher: ${t.username} — දැනටමත් Moodle හි ඇත.`);
        teachersOk++;
      } else {
        console.error(`  ❌ Teacher: ${t.username} — ${err.message}`);
        teachersFail++;
      }
    }
  }

  console.log(`\n📋 ගුරු Sync ප්‍රතිඵලය: ✅ ${teachersOk} සාර්ථක, ❌ ${teachersFail} අසාර්ථක\n`);

  console.log('🎉 Bulk Sync සම්පූර්ණ!');
  process.exit(0);
}

syncAllUsers().catch((err) => {
  console.error('Fatal Sync Error:', err.message);
  process.exit(1);
});
