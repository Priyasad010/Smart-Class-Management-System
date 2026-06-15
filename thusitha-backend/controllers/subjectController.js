const db = require('../db');

exports.getAllSubjects = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM Subjects ORDER BY subject_name ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "විෂයන් ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  const { subject_name, description } = req.body;
  if (!subject_name) {
    return res.status(400).json({ message: "විෂය නාමය අවශ්‍ය වේ." });
  }

  try {
    const result = await db.pool.query(
      'INSERT INTO Subjects (subject_name, description) VALUES ($1, $2) RETURNING *',
      [subject_name, description]
    );
    res.status(201).json({
      message: 'Subject created successfully',
      subject: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "විෂය ඇතුළත් කිරීම අසාර්ථකයි.", error: error.message });
  }
};