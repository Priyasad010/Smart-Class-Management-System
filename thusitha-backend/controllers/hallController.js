const db = require('../db');
const auditService = require('../utils/auditService');

// Get all halls
exports.getAllHalls = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT hall_id, hall_name, capacity FROM Halls ORDER BY hall_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get All Halls Error:', err.message);
    res.status(500).json({ error: 'ශාලා දත්ත ලබා ගැනීමට නොහැකි විය.' });
  }
};

// You can add createHall, updateHall, deleteHall functions here if needed in the future
exports.createHall = async (req, res) => { /* ... */ };
exports.updateHall = async (req, res) => { /* ... */ };
exports.deleteHall = async (req, res) => { /* ... */ };