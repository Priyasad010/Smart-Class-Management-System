const db = require('../db');

/**
 * Retrieves all system audit logs.
 * Includes a join with the Users table to display the name of the person who performed the action.
 */
exports.getAllLogs = async (req, res) => {
  try {
    const query = `
      SELECT al.*, u.username as performed_by_username
      FROM AuditLogs al
      LEFT JOIN Users u ON al.performed_by = u.user_id
      ORDER BY al.timestamp DESC
    `;
    const result = await db.pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get Audit Logs Error:', error.message);
    res.status(500).json({ message: "විගණන වාර්තා ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};