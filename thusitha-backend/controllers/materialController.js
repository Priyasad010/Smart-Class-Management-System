const db = require('../db');
const fs = require('node:fs');

const auditService = require('../utils/auditService');
exports.uploadMaterial = async (req, res) => {
  const { course_id, material_title, material_type } = req.body;
  const teacher_id = req.user.userId;

  if (!req.file || !course_id || !material_title) {
    return res.status(400).json({ message: "විෂය දත්ත සහ ගොනුව අනිවාර්ය වේ." });
  }

  try {
    const query = `
      INSERT INTO Learning_Materials (course_id, teacher_id, material_title, material_type, uploaded_file)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    // Store the path relative to the root for serving static files later
    const result = await db.pool.query(query, [course_id, teacher_id, material_title, material_type || 'PDF', req.file.path]);
    
    await auditService.logAction(req.user.userId, req.user.role, 'FILE_UPLOAD', 'Learning_Material', result.rows[0].material_id, `Uploaded new material: ${material_title} for course ${course_id}.`);
    res.status(201).json({ message: 'ගොනුව සාර්ථකව උඩුගත කරන ලදී.', material: result.rows[0] });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('❌ Material Upload Error:', error.message);
    res.status(500).json({ error: 'ගොනුව උඩුගත කිරීම අසාර්ථකයි.' });
  }
};

exports.getCourseMaterials = async (req, res) => {
  const { courseId } = req.params;
  try {
    const query = `
      SELECT m.*, t.teacher_name 
      FROM Learning_Materials m
      JOIN Teachers t ON m.teacher_id = t.teacher_id
      WHERE m.course_id = $1
      ORDER BY m.uploaded_at DESC
    `;
    const result = await db.pool.query(query, [courseId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};