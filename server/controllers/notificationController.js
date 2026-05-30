const smsService = require('../services/smsService');
const pool = require('../../db');

/**
 * Send a custom manual SMS to a specific student's parent
 */
exports.sendManualSMS = async (req, res, next) => {
  try {
    const { studentId, parentPhone, message } = req.body;

    if (!parentPhone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Parent phone number and message contents are required.'
      });
    }

    const result = await smsService.sendSMS({
      studentId: studentId || null,
      parentPhone,
      message,
      type: 'Manual'
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Manual SMS sent and logged successfully.',
        data: result.log
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'SMS delivery simulated transmission failure.',
        data: result.log
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch all SMS log history entries, joining student's first/last name
 */
exports.getSMSLogs = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        l.id,
        l.student_id,
        l.parent_phone,
        l.message,
        l.type,
        l.status,
        l.sent_at,
        COALESCE(CONCAT(s.first_name, ' ', s.last_name), 'General Announcement / Class Broadcast') AS student_name
      FROM sms_logs l
      LEFT JOIN students s ON l.student_id = s.id
      ORDER BY l.sent_at DESC;
    `;

    const result = await pool.query(selectQuery);

    return res.status(200).json({
      success: true,
      message: 'SMS logs fetched successfully.',
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send bulk announcement texts individually to multiple parent target numbers
 */
exports.sendBulkAnnouncement = async (req, res, next) => {
  try {
    const { recipients, message } = req.body; // recipients is an array: [{ studentId, parentPhone }]

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty array of target parent recipients is required.'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Announcement text message content is required.'
      });
    }

    const results = [];
    let deliveredCount = 0;
    let failedCount = 0;

    // Send individually sequentially/parallelly to simulate real delivery flow
    for (const recipient of recipients) {
      try {
        const sendResult = await smsService.sendSMS({
          studentId: recipient.studentId,
          parentPhone: recipient.parentPhone,
          message,
          type: 'Bulk'
        });

        results.push(sendResult.log);
        if (sendResult.success) {
          deliveredCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
        console.error(`❌ Failed bulk send to student ID ${recipient.studentId}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk announcement broadcast finished. Sent: ${recipients.length}, Delivered: ${deliveredCount}, Failed: ${failedCount}`,
      data: {
        total: recipients.length,
        delivered: deliveredCount,
        failed: failedCount,
        logs: results
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Purge/Delete all SMS history logs from the database
 */
exports.purgeSMSLogs = async (req, res, next) => {
  try {
    const truncateQuery = `DELETE FROM sms_logs;`;
    await pool.query(truncateQuery);
    
    return res.status(200).json({
      success: true,
      message: 'All SMS delivery logs have been permanently purged successfully.'
    });
  } catch (err) {
    next(err);
  }
};

