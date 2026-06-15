const db = require('../db');
const auditService = require('../utils/auditService');
const fs = require('node:fs');

exports.getPromos = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM Promotion_Content ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPromo = async (req, res) => {
  const { content_type, title, description } = req.body;
  const image_url = req.file ? req.file.path : null;

  try {
    const result = await db.pool.query(
      'INSERT INTO Promotion_Content (content_type, title, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [content_type, title, description, image_url]
    );
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Promotion', result.rows[0].promo_id, `Created promo: ${title}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePromo = async (req, res) => {
  const { id } = req.params;
  try {
    const promo = await db.pool.query('SELECT image_url FROM Promotion_Content WHERE promo_id = $1', [id]);
    if (promo.rows.length > 0 && promo.rows[0].image_url && fs.existsSync(promo.rows[0].image_url)) {
      fs.unlinkSync(promo.rows[0].image_url);
    }
    await db.pool.query('DELETE FROM Promotion_Content WHERE promo_id = $1', [id]);
    res.json({ message: 'Promotional content deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};