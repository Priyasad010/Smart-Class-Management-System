const db = require('../db');

/**
 * Helper to send SMS messages.
 * In production, replace the console.log with your SMS Gateway API (e.g., Twilio, Notify.lk, etc.)
 */
const sendSMS = async (phoneNumber, message, parentName = 'Parent', smsType = 'General') => {
  try {
    // 💡 Integration Point: This is where you would call your SMS Provider API
    console.log(`📱 [SMS Sent] To: ${phoneNumber} (${parentName}) | Type: ${smsType} | Content: ${message}`);

    // Log the SMS to the database so it shows up in the SMS Logs tab in your Dashboard
    const query = `
      INSERT INTO SMSLogs (parent_name, parent_phone, message_body, sms_type)
      VALUES ($1, $2, $3, $4)
    `;
    await db.pool.query(query, [parentName, phoneNumber, message, smsType]);

    return { success: true };
  } catch (err) {
    console.error('❌ SMS Helper Error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSMS };