const db = require('../db');
const auditService = require('../utils/auditService');

exports.getPromos = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM Promotions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Promos Error:', err.message);
    res.status(500).json({ error: 'ප්‍රවර්ධන දත්ත ලබා ගැනීමට නොහැකි විය.' });
  }
};

exports.createPromo = async (req, res) => {
  const { title, content_type, description } = req.body;
  const image_url = req.file ? req.file.path : null; // Assuming multer saves path to req.file.path

  if (!title || !content_type) {
    return res.status(400).json({ message: 'Title and Content Type are required.' });
  }

  try {
    const result = await db.pool.query(
      'INSERT INTO Promotions (title, content_type, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content_type, description, image_url]
    );
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Promotion', result.rows[0].promo_id, `Created promotion: ${title}`);
    res.status(201).json({ message: 'Promotion created successfully!', promo: result.rows[0] });
  } catch (err) {
    console.error('❌ Create Promo Error:', err.message);
    res.status(500).json({ error: 'Failed to create promotion.' });
  }
};

exports.deletePromo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query('DELETE FROM Promotions WHERE promo_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) { return res.status(404).json({ message: 'Promotion not found.' }); }
    // Optionally delete the file from the server if image_url exists
    // fs.unlinkSync(path.join(process.cwd(), result.rows[0].image_url));
    await auditService.logAction(req.user.userId, req.user.role, 'DELETE', 'Promotion', id, `Deleted promotion ID: ${id}`);
    res.status(200).json({ message: 'Promotion deleted successfully!' });
  } catch (err) {
    console.error('❌ Delete Promo Error:', err.message);
    res.status(500).json({ error: 'Failed to delete promotion.' });
  }
};