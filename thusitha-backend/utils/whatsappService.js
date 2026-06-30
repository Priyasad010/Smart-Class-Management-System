const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('../db');

// Initialize WhatsApp Client
const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isWhatsAppReady = false;

whatsappClient.on('qr', (qr) => {
    console.log('\n\n======================================================');
    console.log('📱 WHATSAPP QR CODE REQUIRED!');
    console.log('Please scan this QR code with your WhatsApp to enable Messaging:');
    console.log('======================================================\n\n');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Client is READY and linked!');
    isWhatsAppReady = true;
});

whatsappClient.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client was disconnected:', reason);
    isWhatsAppReady = false;
    whatsappClient.initialize();
});

// Start initialization
whatsappClient.initialize();

/**
 * 📝 Helper: Log WhatsApp message to the database for history and retry tracking.
 */
const logWhatsAppMessage = async (parentId, phone, type, body, status) => {
  try {
    await db.pool.query(
      `INSERT INTO WhatsApp_Logs (parent_id, parent_phone, message_type, message_body, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [parentId, phone, type, body, status]
    );
  } catch (err) {
    console.error('❌ WhatsApp Logging Error:', err.message);
  }
};

const sendWhatsAppMessage = async (phone, messageBody, parentId, type) => {
  let statusResult = 'Sent';
  try {
    if (isWhatsAppReady) {
      // WhatsApp requires format: 9477xxxxxxx@c.us
      let formattedPhone = phone.replace('+', '').replace(/\s/g, '');
      if (formattedPhone.length === 10 && formattedPhone.startsWith('0')) {
        formattedPhone = '94' + formattedPhone.substring(1);
      } else if (formattedPhone.length === 9) {
        formattedPhone = '94' + formattedPhone;
      }
      const chatId = `${formattedPhone}@c.us`;
      await whatsappClient.sendMessage(chatId, messageBody);
    } else {
      console.log(`[WHATSAPP NOT READY] To: ${phone} | Body: ${messageBody}`);
      statusResult = 'Failed';
    }
  } catch(error) {
     console.error('WhatsApp Error:', error.message);
     statusResult = 'Failed';
  }
  
  await logWhatsAppMessage(parentId, phone, type, messageBody, statusResult);
  return { success: statusResult === 'Sent' };
};

exports.sendAttendanceWhatsApp = async (studentId, courseName, timeString, status) => {
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
    const messageBody = `*Thusitha Institute*\n\n${student_name} is marked *${status}* for ${courseName} at ${timeString}.`;

    await sendWhatsAppMessage(parent_phone, messageBody, parent_id, 'Attendance');
  } catch (error) {
    console.error('❌ sendAttendanceWhatsApp Error:', error.message);
  }
};

exports.sendLatePaymentWhatsApp = async (studentId, studentName, parentPhone, courseName, month) => {
  try {
    const messageBody = `*Payment Reminder*\n\n${studentName}'s fee for ${courseName} (${month}) is pending at Thusitha Institute.`;
    const parentRes = await db.pool.query('SELECT parent_id FROM Students WHERE student_id = $1', [studentId]);
    const parentId = parentRes.rows[0]?.parent_id;

    await sendWhatsAppMessage(parentPhone, messageBody, parentId, 'Payment');
  } catch (error) {
    console.error('❌ sendLatePaymentWhatsApp Error:', error.message);
  }
};

exports.sendDiscrepancyWhatsApp = async (parentPhone, studentName, courseName) => {
  try {
    const messageBody = `*Security Alert*\n\nAttendance discrepancy detected for ${studentName} in ${courseName}. Please contact Thusitha Institute.`;
    const parentRes = await db.pool.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [parentPhone]);
    const parentId = parentRes.rows[0]?.parent_id;

    await sendWhatsAppMessage(parentPhone, messageBody, parentId, 'Security');
  } catch (error) {
    console.error('❌ sendDiscrepancyWhatsApp Error:', error.message);
  }
};

exports.sendCustomWhatsApp = async (phone, body) => {
  try {
    const parentRes = await db.pool.query('SELECT parent_id FROM Parents WHERE parent_phone = $1', [phone]);
    const parentId = parentRes.rows[0]?.parent_id;

    return await sendWhatsAppMessage(phone, body, parentId, 'Custom');
  } catch (error) {
    console.error('❌ sendCustomWhatsApp Error:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendExamResultWhatsApp = async (studentId, examName, marks, totalMarks) => {
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
    const messageBody = `*Exam Result*\n\n${student_name} scored *${marks}/${totalMarks}* for ${examName} at Thusitha Institute.`;

    await sendWhatsAppMessage(parent_phone, messageBody, parent_id, 'Exam');
  } catch (error) {
    console.error('❌ sendExamResultWhatsApp Error:', error.message);
  }
};