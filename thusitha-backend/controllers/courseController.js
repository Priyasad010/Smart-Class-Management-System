const db = require('../db');

// ඩේටාබේස් එකෙන් සියලුම පන්ති ලබා දීම
exports.getAllCourses = async (req, res) => {
  try {
    const query = 'SELECT * FROM Courses ORDER BY course_name ASC';
    const result = await db.pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get All Courses Error:', error.message);
    res.status(500).json({ message: "පන්ති දත්ත ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};