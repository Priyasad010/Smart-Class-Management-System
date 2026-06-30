const db = require('../db');
const bcrypt = require('bcryptjs');

const auditService = require('../utils/auditService');
exports.registerParent = async (req, res) => {
  const { username, password, parent_name, parent_phone, address } = req.body;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create the User record (Role: Parent)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userResult = await client.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [username, passwordHash, 'Parent']
    );
    const userId = userResult.rows[0].user_id;

    // 2. Create the Parent profile linked to user_id
    const parentResult = await client.query(
      'INSERT INTO Parents (user_id, parent_name, parent_phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, parent_name, parent_phone, address]
    );

    await client.query('COMMIT');
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Parent', parentResult.rows[0].parent_id, `Registered new parent: ${parent_name} (User ID: ${userId})`);
    res.status(201).json({ message: 'Parent registered successfully', parent: parentResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Parent Registration Error:', err.message);
    res.status(500).json({ error: 'Failed to register parent', details: err.message });
  } finally {
    client.release();
  }
};

exports.getAllParents = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM Parents ORDER BY parent_id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get All Parents Error:', error.message);
    res.status(500).json({ message: "මව්පියන්ගේ දත්ත ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};