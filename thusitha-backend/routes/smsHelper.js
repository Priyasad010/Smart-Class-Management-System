const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get all SMS Logs (Used by the Dashboard tab)
router.get('/logs', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM SMSLogs ORDER BY sent_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;