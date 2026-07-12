const db = require('../db'); // Assuming db.js is in the parent directory

/**
 * Audit log function to record user actions.
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} role - The role of the user.
 * @param {string} actionType - Type of action (e.g., 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'ALERT').
 * @param {string} targetTable - The table affected by the action (e.g., 'User', 'Student', 'Attendance').
 * @param {number | null} targetId - The ID of the record affected, if applicable.
 * @param {string} details - A descriptive string of the action.
 */
const logAction = async (userId, role, actionType, targetTable, targetId, details) => {
  try {
    const query = `
      INSERT INTO AuditLogs (performed_by, role, action_type, target_table, target_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.pool.query(query, [userId, role, actionType, targetTable, targetId, details]);
  } catch (error) {
    console.error('❌ Failed to write audit log:', error.message);
    // It's important not to re-throw here, as audit logging should not block core functionality.
  }
};

module.exports = {
  logAction,
};