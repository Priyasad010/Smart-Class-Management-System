const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/logs', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const query = `
      SELECT l.*, p.parent_name, p.parent_phone 
      FROM SMS_Logs l
      JOIN Parents p ON l.parent_id = p.parent_id
      ORDER BY l.sent_at DESC
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;