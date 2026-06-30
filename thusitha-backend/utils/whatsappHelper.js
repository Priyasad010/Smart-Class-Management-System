const db = require('../db');

/**
 * Helper to send WhatsApp messages.
 */
const sendWhatsApp = async (phoneNumber, message, parentName = 'Parent', messageType = 'General') => {
  try {
    console.log(`📱 [WhatsApp Sent] To: ${phoneNumber} (${parentName}) | Type: ${messageType} | Content: ${message}`);

    // Log the message to the database
    const query = `
      INSERT INTO WhatsApp_Logs (parent_name, parent_phone, message_body, message_type)
      VALUES ($1, $2, $3, $4)
    `;
    await db.pool.query(query, [parentName, phoneNumber, message, messageType]);

    return { success: true };
  } catch (err) {
    console.error('❌ WhatsApp Helper Error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendWhatsApp };