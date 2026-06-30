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

exports.createCourse = async (req, res) => {
  const { course_name, monthly_fee } = req.body;
  try {
    const query = 'INSERT INTO Courses (course_name, monthly_fee) VALUES ($1, $2) RETURNING *';
    const result = await db.pool.query(query, [course_name, monthly_fee]);
    res.status(201).json({ message: 'පාඨමාලාව සාර්ථකව එකතු කළා!', course: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await db.pool.query('DELETE FROM Courses WHERE course_id = $1', [id]);
    res.json({ message: 'පාඨමාලාව සාර්ථකව ඉවත් කළා!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};