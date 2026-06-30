const db = require('../db');
const auditService = require('../utils/auditService');
const ExcelJS = require('exceljs'); // Assuming ExcelJS is used for uploadExcelMarks
const { google } = require('googleapis');

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
  const { userId, role } = req.user;
  try {
    let query;
    let params;

    if (role === 'Student') {
      const studentRes = await db.pool.query('SELECT student_id FROM Students WHERE user_id = $1', [userId]);
      if (studentRes.rows.length === 0) {
        return res.status(404).json({ message: 'ශිෂ්‍ය ගිණුම සොයාගත නොහැකි විය.' });
      }
      const studentId = studentRes.rows[0].student_id;

      query = `
        SELECT er.student_id, s.student_name, er.marks
        FROM Exam_Results er
        JOIN Students s ON er.student_id = s.student_id
        WHERE er.exam_id = $1 AND er.student_id = $2
        ORDER BY s.student_name ASC;
      `;
      params = [examId, studentId];
    } else {
      query = `
        SELECT er.student_id, s.student_name, er.marks
        FROM Exam_Results er
        JOIN Students s ON er.student_id = s.student_id
        WHERE er.exam_id = $1
        ORDER BY s.student_name ASC;
      `;
      params = [examId];
    }

    const result = await db.pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Get Exam Results Error:', err.message);
    res.status(500).json({ error: 'විභාග ප්‍රතිඵල ලබා ගැනීමට නොහැකි විය.' });
  }
};

const resolveStudentId = async (client, identifier) => {
  if (!identifier) return null;
  const cleanId = identifier.toString().trim();
  
  // Try resolving as qr_code_key, username, or student_name (case-insensitive)
  const res = await client.query(
    `SELECT s.student_id FROM Students s 
     JOIN Users u ON s.user_id = u.user_id 
     WHERE LOWER(s.qr_code_key) = LOWER($1) 
        OR LOWER(u.username) = LOWER($1) 
        OR LOWER(s.student_name) = LOWER($1)`,
    [cleanId]
  );
  if (res.rows.length > 0) return res.rows[0].student_id;
  
  // If it's already an integer, try checking if it exists directly as student_id
  if (!isNaN(parseInt(cleanId))) {
    const resId = await client.query('SELECT student_id FROM Students WHERE student_id = $1', [parseInt(cleanId)]);
    if (resId.rows.length > 0) return resId.rows[0].student_id;
  }
  return null;
};

exports.uploadExcelMarks = async (req, res) => {
  console.log('--- UPLOAD EXCEL MARKS HIT ---');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  const { exam_id } = req.body;
  if (!req.file) {
    console.log('Error: No file uploaded');
    return res.status(400).json({ message: 'කරුණාකර Excel ගොනුවක් උඩුගත කරන්න.' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    console.log('Excel file read successfully');
    const worksheet = workbook.getWorksheet(1);
    const marksToInsert = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
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
      const unres = [];
      for (const mark of marksToInsert) {
        const resolvedId = await resolveStudentId(client, mark.student_id);
        if (resolvedId) {
          await client.query(
            'INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES ($1, $2, $3) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = EXCLUDED.marks',
            [resolvedId, exam_id, mark.marks]
          );
        } else {
          unres.push(mark.student_id);
        }
      }
      if (unres.length > 0) {
        throw new Error(`හඳුනාගත නොහැකි ශිෂ්‍ය හැඳුනුම්පත් (Invalid Student IDs): ${unres.join(', ')}`);
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
    res.status(500).json({ error: err.message || 'ලකුණු උඩුගත කිරීම අසාර්ථකයි.' });
  }
};

exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { exam_name, exam_date, total_marks, pass_percentage } = req.body;
  try {
    const result = await db.pool.query(
      'UPDATE Exams SET exam_name = $1, exam_date = $2, total_marks = $3, pass_percentage = $4 WHERE exam_id = $5 RETURNING *',
      [exam_name, exam_date, total_marks, pass_percentage, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'විභාගය හමුවුනේ නැත.' });
    }
    await auditService.logAction(req.user?.userId, req.user?.role, 'UPDATE', 'Exams', id, `Updated exam: ${exam_name}`);
    res.json({ message: 'විභාගය සාර්ථකව යාවත්කාලීන කළා!', exam: result.rows[0] });
  } catch (err) {
    console.error('❌ Update Exam Error:', err.message);
    res.status(500).json({ error: 'විභාගය යාවත්කාලීන කිරීම අසාර්ථකයි.' });
  }
};

exports.deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query('DELETE FROM Exams WHERE exam_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'විභාගය හමුවුනේ නැත.' });
    }
    await auditService.logAction(req.user?.userId, req.user?.role, 'DELETE', 'Exams', id, `Deleted exam: ${result.rows[0].exam_name}`);
    res.json({ message: 'විභාගය සාර්ථකව මකා දැමුවා!' });
  } catch (err) {
    console.error('❌ Delete Exam Error:', err.message);
    res.status(500).json({ error: 'විභාගය මකා දැමීම අසාර්ථකයි. (මෙම විභාගයට ලකුණු ඇතුළත් කර ඇත්නම් එය මකා දැමිය නොහැක)' });
  }
};

/**
 * 📊 Pull Exam Marks from Google Sheets directly
 */
exports.pullGoogleSheetMarks = async (req, res) => {
  const { exam_id, sheet_id, range = 'Sheet1!A2:B' } = req.body;
  if (!exam_id || !sheet_id) {
    return res.status(400).json({ message: 'exam_id සහ sheet_id අත්‍යවශ්‍ය වේ.' });
  }

  try {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-google-api-key-here') {
      return res.status(500).json({ message: 'Google Sheets API Key එක පිහිටුවා නැත. කරුණාකර .env ගොනුව යාවත්කාලීන කරන්න.' });
    }
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Google Sheet එකෙහි දත්ත නොමැත.' });
    }

    const marksToInsert = [];
    rows.forEach(row => {
      const student_id = row[0];
      const marks = row[1];
      if (student_id && marks !== undefined) {
        marksToInsert.push({ student_id, marks: Number.parseFloat(marks) });
      }
    });

    if (marksToInsert.length === 0) {
      return res.status(400).json({ message: 'Google Sheet එකෙහි වලංගු දත්ත නොමැත.' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const unres = [];
      for (const mark of marksToInsert) {
        const resolvedId = await resolveStudentId(client, mark.student_id);
        if (resolvedId) {
          await client.query(
            'INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES ($1, $2, $3) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = EXCLUDED.marks',
            [resolvedId, exam_id, mark.marks]
          );
        } else {
          unres.push(mark.student_id);
        }
      }
      if (unres.length > 0) {
        throw new Error(`හඳුනාගත නොහැකි ශිෂ්‍ය හැඳුනුම්පත් (Invalid Student IDs): ${unres.join(', ')}`);
      }
      await client.query('COMMIT');
      await auditService.logAction(req.user?.userId, req.user?.role, 'UPLOAD', 'Exam_Results', exam_id, `Pulled marks from Google Sheet ${sheet_id}`);
      res.status(200).json({ message: `Google Sheet එකෙන් ලකුණු ${marksToInsert.length} ක් සාර්ථකව ඇතුළත් කළා!` });
    } catch (transactionErr) {
      await client.query('ROLLBACK');
      throw transactionErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Google Sheets Error:', err.message);
    res.status(500).json({ error: 'Google Sheet එකෙන් දත්ත ලබා ගැනීම අසාර්ථකයි.', details: err.message });
  }
};