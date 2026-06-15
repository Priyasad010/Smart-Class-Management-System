const twilio = require('twilio');
const db = require('../db');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// 🛡️ Industrial Fix: Prevents crash if keys are missing or placeholders
const isTwilioConfigured = accountSid && authToken && accountSid.startsWith('AC');
const client = isTwilioConfigured ? new twilio(accountSid, authToken) : null;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

/**
 * 📝 Helper: Log SMS to the database for history and retry tracking.
 */
const logSMS = async (parentId, phone, type, body, status) => {
  try {
    await db.pool.query(
      `INSERT INTO SMS_Logs (parent_id, parent_phone, sms_type, message_body, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [parentId, phone, type, body, status]
    );
  } catch (err) {
    console.error('❌ SMS Logging Error:', err.message);
  }
};

exports.sendAttendanceSMS = async (studentId, courseName, timeString, status) => {
  try {
    const parentRes = await db.pool.query(
      `SELECT p.parent_id, p.parent_phone, s.student_name 
       FROM Students s 
       JOIN Parents p ON s.parent_id = p.parent_id 
       WHERE s.student_id = $1`,
      [studentId]
    );
    if (parentRes.rows.length === 0) return;

    const { parent_id, parent_phone, student_name } = parentRes.rows[0];
    const messageBody = `Thusitha Institute: ${student_name} is marked ${status} for ${courseName} at ${timeString}.`;

    let statusResult = 'Sent';
    if (client) {
      const message = await client.messages.create({
        body: messageBody,
        to: parent_phone,
        from: fromPhone
      });
      if (message.status === 'failed') statusResult = 'Failed';
    } else {
      console.log(`[SMS MOCK] To: ${parent_phone} | Body: ${messageBody}`);
    }

    await logSMS(parent_id, parent_phone, 'Attendance', messageBody, statusResult);
  } catch (error) {
    console.error('❌ sendAttendanceSMS Error:', error.message);
  }
};

exports.sendLatePaymentSMS = async (studentId, studentName, parentPhone, courseName, month) => {
  try {
    const messageBody = `Payment Reminder: ${studentName}'s fee for ${courseName} (${month}) is pending at Thusitha Institute.`;
    
    let statusResult = 'Sent';
    if (client) {
      const message = await client.messages.create({
        body: messageBody,
        to: parentPhone,
        from: fromPhone
      });
      if (message.status === 'failed') statusResult = 'Failed';
    } else {
      console.log(`[SMS MOCK] To: ${parentPhone} | Body: ${messageBody}`);
    }

    const parentRes = await db.pool.query('SELECT parent_id FROM Students WHERE student_id = $1', [studentId]);
    const parentId = parentRes.rows[0]?.parent_id;

    await logSMS(parentId, parentPhone, 'Payment', messageBody, statusResult);
  } catch (error) {
    console.error('❌ sendLatePaymentSMS Error:', error.message);
  }
};

exports.sendDiscrepancySMS = async (parentPhone, studentName, courseName) => {
  try {
    const messageBody = `Security Alert: Attendance discrepancy detected for ${studentName} in ${courseName}. Please contact Thusitha Institute.`;
    
    let statusResult = 'Sent';
    if (client) {
      const message = await client.messages.create({
        body: messageBody,
        to: parentPhone,
        from: fromPhone
      });
      if (message.status === 'failed') statusResult = 'Failed';
    } else {
      console.log(`[SMS MOCK] To: ${parentPhone} | Body: ${messageBody}`);
    }

    const parentRes = await db.pool.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [parentPhone]);
    const parentId = parentRes.rows[0]?.parent_id;

    await logSMS(parentId, parentPhone, 'Security', messageBody, statusResult);
  } catch (error) {
    console.error('❌ sendDiscrepancySMS Error:', error.message);
  }
};

exports.sendCustomSMS = async (phone, body) => {
  try {
    let statusResult = 'Sent';
    if (client) {
      const message = await client.messages.create({
        body: body,
        to: phone,
        from: fromPhone
      });
      if (message.status === 'failed') statusResult = 'Failed';
    } else {
      console.log(`[SMS MOCK] To: ${phone} | Body: ${body}`);
    }

    const parentRes = await db.pool.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [phone]);
    const parentId = parentRes.rows[0]?.parent_id;

    await logSMS(parentId, phone, 'Custom', body, statusResult);
  } catch (error) {
    console.error('❌ sendCustomSMS Error:', error.message);
  }
};

/**
 * 🎓 New: Send Exam Results to Parents
 */
exports.sendExamResultSMS = async (studentId, examName, marks, totalMarks) => {
  try {
    const parentRes = await db.pool.query(
      `SELECT p.parent_id, p.parent_phone, s.student_name 
       FROM Students s 
       JOIN Parents p ON s.parent_id = p.parent_id 
       WHERE s.student_id = $1`,
      [studentId]
    );
    if (parentRes.rows.length === 0) return;

    const { parent_id, parent_phone, student_name } = parentRes.rows[0];
    const messageBody = `Exam Result: ${student_name} scored ${marks}/${totalMarks} for ${examName} at Thusitha Institute.`;

    let statusResult = 'Sent';
    if (client) {
      const message = await client.messages.create({
        body: messageBody,
        to: parent_phone,
        from: fromPhone
      });
      if (message.status === 'failed') statusResult = 'Failed';
    } else {
      console.log(`[SMS MOCK] To: ${parent_phone} | Body: ${messageBody}`);
    }

    await logSMS(parent_id, parent_phone, 'Exam', messageBody, statusResult);
  } catch (error) {
    console.error('❌ sendExamResultSMS Error:', error.message);
  }
};