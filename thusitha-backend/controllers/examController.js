const db = require('../db');
const auditService = require('../utils/auditService');
const ExcelJS = require('exceljs'); // Assuming ExcelJS is used for uploadExcelMarks

exports.createExam = async (req, res) => {
  const { course_id, exam_name, exam_date, total_marks, pass_percentage } = req.body;
  try {
    const result = await db.pool.query(
      'INSERT INTO Exams (course_id, exam_name, exam_date, total_marks, pass_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [course_id, exam_name, exam_date, total_marks, pass_percentage]
    );
    await auditService.logAction(req.user.userId, req.user.role, 'CREATE', 'Exam', result.rows[0].exam_id, `Created exam: ${exam_name}`);
    res.status(201).json({ message: 'විභාගය සාර්ථකව ඇතුළත් කළා!', exam: result.rows[0] });
  } catch (err) {
    console.error('❌ Create Exam Error:', err.message);
    res.status(500).json({ error: 'විභාගය ඇතුළත් කිරීම අසාර්ථකයි.' });
  }
};

exports.getCourseExams = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await db.pool.query('SELECT * FROM Exams WHERE course_id = $1 ORDER BY exam_date DESC', [courseId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Course Exams Error:', err.message);
    res.status(500).json({ error: 'විභාග ලබා ගැනීමට නොහැකි විය.' });
  }
};

exports.getExamResults = async (req, res) => {
  const { examId } = req.params;
  try {
    const query = `
      SELECT er.student_id, s.student_name, er.marks
      FROM Exam_Results er
      JOIN Students s ON er.student_id = s.student_id
      WHERE er.exam_id = $1
      ORDER BY s.student_name ASC;
    `;
    const result = await db.pool.query(query, [examId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Exam Results Error:', err.message);
    res.status(500).json({ error: 'විභාග ප්‍රතිඵල ලබා ගැනීමට නොහැකි විය.' });
  }
};

exports.uploadExcelMarks = async (req, res) => {
  const { exam_id } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'කරුණාකර Excel ගොනුවක් උඩුගත කරන්න.' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    const marksToInsert = [];

    worksheet.eachRow({ firstRow: 2 }, (row, rowNumber) => {
      const student_id = row.getCell(1).value;
      const marks = row.getCell(2).value;
      if (student_id && marks !== undefined) {
        marksToInsert.push({ student_id, marks: Number.parseFloat(marks) });
      }
    });

    if (marksToInsert.length === 0) {
      return res.status(400).json({ message: 'Excel ගොනුවේ වලංගු දත්ත නොමැත.' });
    }

    // Batch insert/update marks
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      for (const mark of marksToInsert) {
        await client.query(
          'INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES ($1, $2, $3) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = EXCLUDED.marks',
          [mark.student_id, exam_id, mark.marks]
        );
      }
      await client.query('COMMIT');
      await auditService.logAction(req.user.userId, req.user.role, 'UPLOAD', 'Exam_Results', exam_id, `Uploaded marks for exam ID: ${exam_id}`);
      res.status(200).json({ message: 'ලකුණු සාර්ථකව ඇතුළත් කළා!' });
    } catch (transactionErr) {
      await client.query('ROLLBACK');
      throw transactionErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Upload Excel Marks Error:', err.message);
    res.status(500).json({ error: 'ලකුණු උඩුගත කිරීම අසාර්ථකයි.' });
  }
};

exports.updateExam = async (req, res) => { /* implementation */ };
exports.deleteExam = async (req, res) => { /* implementation */ };