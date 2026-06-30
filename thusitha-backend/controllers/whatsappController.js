const db = require('../db');
const auditService = require('../utils/auditService');
const whatsappService = require('../utils/whatsappService');

/**
 * Retrieves all WhatsApp logs from the database.
 */
exports.getWhatsAppLogs = async (req, res) => {
  try {
    const result = await db.pool.query(
      `SELECT sl.*, p.parent_name 
       FROM WhatsApp_Logs sl 
       LEFT JOIN Parents p ON sl.parent_id = p.parent_id 
       ORDER BY sl.sent_at DESC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get WhatsApp Logs Error:', error.message);
    res.status(500).json({
      message: 'WhatsApp වාර්තා ලබා ගැනීමට නොහැකි විය.',
      error: error.message
    });
  }
};

/**
 * Resends a specific WhatsApp based on its log ID.
 */
exports.resendWhatsApp = async (req, res) => {
  const { logId } = req.params;

  try {
    const logResult = await db.pool.query(
      'SELECT * FROM WhatsApp_Logs WHERE log_id = $1',
      [logId]
    );

    if (logResult.rows.length === 0) {
      return res.status(404).json({
        message: 'WhatsApp වාර්තාව හමුවුනේ නැත.'
      });
    }

    const smsLog = logResult.rows[0];

    const sendResult = await whatsappService.sendCustomWhatsApp(
      smsLog.parent_phone,
      smsLog.message_body
    );

    if (sendResult.success) {
      await db.pool.query(
        `UPDATE WhatsApp_Logs
         SET status = 'RESENT'
         WHERE log_id = $1`,
        [logId]
      );

      if (req.user) {
        await auditService.logAction(
          req.user.userId,
          req.user.role,
          'RESEND_WhatsApp',
          'WhatsApp_Logs',
          logId,
          `WhatsApp resent to ${smsLog.parent_phone}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'WhatsApp එක නැවත යවන ලදී.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'WhatsApp එක යැවීමට අසමත් විය.'
    });

  } catch (error) {
    console.error('❌ Resend WhatsApp Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'WhatsApp නැවත යැවීමේදී දෝෂයක් ඇති විය.',
      error: error.message
    });
  }
};

/**
 * Resends all failed WhatsApp messages for a given date.
 */
exports.bulkResendWhatsApp = async (req, res) => {
  const { date } = req.body; // Expecting date in 'YYYY-MM-DD' format

  if (!date) {
    return res.status(400).json({ message: 'කරුණාකර නැවත යැවීමට දිනයක් ලබා දෙන්න.' });
  }

  try {
    const failedLogsResult = await db.pool.query(
      `SELECT * FROM WhatsApp_Logs WHERE status = 'Failed' AND DATE(sent_at) = $1`,
      [date]
    );

    let successCount = 0;
    for (const smsLog of failedLogsResult.rows) {
      const sendResult = await whatsappService.sendCustomWhatsApp(smsLog.parent_phone, smsLog.message_body);
      if (sendResult.success) {
        await db.pool.query(
          `UPDATE WhatsApp_Logs SET status = 'RESENT' WHERE log_id = $1`,
          [smsLog.log_id]
        );
        successCount++;
      }
    }

    await auditService.logAction(
      req.user.userId,
      req.user.role,
      'BULK_RESEND_WhatsApp',
      'WhatsApp_Logs',
      null,
      `Bulk resend initiated for date ${date}. ${successCount} WhatsApp resent.`
    );

    res.status(200).json({
      message: `සාර්ථකයි! ${successCount} WhatsApp නැවත යවන ලදී.`,
      total_failed: failedLogsResult.rows.length,
      resent_count: successCount,
    });
  } catch (error) {
    console.error('❌ Bulk Resend WhatsApp Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Bulk WhatsApp නැවත යැවීමේදී දෝෂයක් ඇති විය.',
      error: error.message,
    });
  }
};

/**
 * Resends a list of specific WhatsApp messages by their log IDs.
 */
exports.bulkResendWhatsAppByIds = async (req, res) => {
  const { ids } = req.body; // Expecting an array of log_ids

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'කරුණාකර නැවත යැවීමට WhatsApp ID තෝරන්න.' });
  }

  try {
    let successCount = 0;
    for (const logId of ids) {
      // Re-use the resendWhatsApp logic for each ID
      // Note: This might be inefficient for very large arrays, consider a single query for status update
      const logResult = await db.pool.query('SELECT parent_phone, message_body FROM WhatsApp_Logs WHERE log_id = $1', [logId]);
      if (logResult.rows.length > 0) {
        const smsLog = logResult.rows[0];
        const sendResult = await whatsappService.sendCustomWhatsApp(smsLog.parent_phone, smsLog.message_body);
        if (sendResult.success) {
          await db.pool.query(`UPDATE WhatsApp_Logs SET status = 'RESENT' WHERE log_id = $1`, [logId]);
          successCount++;
        }
      }
    }
    await auditService.logAction(req.user.userId, req.user.role, 'BULK_RESEND_WhatsApp_BY_IDS', 'WhatsApp_Logs', null, `Bulk resent ${successCount} WhatsApp by IDs.`);
    res.status(200).json({ message: `සාර්ථකයි! ${successCount} WhatsApp නැවත යවන ලදී.` });
  } catch (error) {
    console.error('❌ Bulk Resend WhatsApp by IDs Error:', error.message);
    res.status(500).json({ message: 'Bulk WhatsApp නැවත යැවීමේදී දෝෂයක් ඇති විය.', error: error.message });
  }
};

/**
 * Sends a custom WhatsApp message to a specified phone number.
 */
exports.sendCustomWhatsApp = async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ message: 'කරුණාකර දුරකථන අංකය සහ පණිවිඩය ඇතුළත් කරන්න.' });
  }

  try {
    const sendResult = await whatsappService.sendCustomWhatsApp(phone, message);

    if (sendResult.success) {
      await auditService.logAction(req.user.userId, req.user.role, 'SEND_CUSTOM_WhatsApp', 'WhatsApp_Logs', null, `Custom WhatsApp sent to ${phone}.`);
      res.status(200).json({ success: true, message: 'Custom WhatsApp එක සාර්ථකව යවන ලදී.' });
    } else {
      res.status(400).json({ success: false, message: 'Custom WhatsApp එක යැවීමට අසමත් විය.', error: sendResult.error });
    }
  } catch (error) {
    console.error('❌ Send Custom WhatsApp Error:', error.message);
    res.status(500).json({ success: false, message: 'Custom WhatsApp එක යැවීමේදී දෝෂයක් ඇති විය.', error: error.message });
  }
};