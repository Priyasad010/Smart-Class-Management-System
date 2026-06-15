const db = require('../db');

// පද්ධති පරිශීලකයින් සියලුම දෙනා ලබා ගැනීම (Teachers/Staff)
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT user_id, username, role, created_at 
      FROM Users 
      WHERE role != 'Student'
      ORDER BY created_at DESC
    `;
    const result = await db.pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get All Users Error:', error.message);
    res.status(500).json({ message: "පරිශීලකයින් ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};