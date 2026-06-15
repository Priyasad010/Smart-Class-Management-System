const db = require('../db');
const ExcelJS = require('exceljs');
const fs = require('node:fs');

const smsService = require('../utils/smsService'); // Assuming you have an smsService
// විභාගයක් නිර්මාණය කිරීම
exports.createExam = async (req, res) => {
  const { course_id, exam_name, exam_date, total_marks, pass_percentage } = req.body;
  if (pass_percentage !== undefined && (pass_percentage < 0 || pass_percentage > 100)) {
    return res.status(400).json({ error: 'සමත් ප්‍රතිශතය 0 ත් 100 ත් අතර විය යුතුය.' });
  }

  try {
    const query = `
      INSERT INTO Exams (course_id, exam_name, exam_date, total_marks, pass_percentage)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await db.pool.query(query, [course_id, exam_name, exam_date, total_marks || 100, pass_percentage || 50]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// පන්තියකට අදාළ විභාග ලබා ගැනීම
exports.getCourseExams = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await db.pool.query('SELECT * FROM Exams WHERE course_id = $1 ORDER BY exam_date DESC', [courseId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// තනි ලකුණක් ඇතුළත් කිරීම
exports.addMarks = async (req, res) => {
  const { student_id, exam_id, marks } = req.body;
  try {
    const query = `
      INSERT INTO Exam_Results (student_id, exam_id, marks)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = EXCLUDED.marks
      RETURNING *
    `;
    const result = await db.pool.query(query, [student_id, exam_id, marks]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excel මගින් තොග පිටින් ලකුණු ඇතුළත් කිරීම
const parseExcelData = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  const data = [];
  const headers = [];

  // Optimized value extraction helper
  const getCellValueAsString = (cell) => {
    let value = cell.value;
    if (value == null) return '';
    if (value.result !== undefined) value = value.result; // Handle formulas
    if (typeof value === 'object') {
        return (value.text || value.richText?.map(t => t.text).join('') || '').trim();
    }
    return String(value).trim();
  };

  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = getCellValueAsString(cell);
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber]?.toLowerCase().replace(/\s+/g, '_');
      if (header) rowData[header] = cell.value;
    });
    data.push(rowData);
  });
  return data;
};

const getRecordValues = (record) => {
  // Flexible header matching
  const studentId = record.student_id || record.student_id || record.id;
  const marks = record.marks || record.score;
  return { studentId, marks };
};

const saveExamResults = async (client, data, exam_id) => {
  // Industrial Tip: Using individual queries inside a transaction is safe, 
  // but for 1,000+ records, consider building a single UNNEST query in the future.
  for (const record of data) {
    const { studentId, marks } = getRecordValues(record);
    
    if (!studentId || marks === undefined) continue;

    await client.query(
      'INSERT INTO Exam_Results (student_id, exam_id, marks) VALUES ($1, $2, $3) ON CONFLICT (student_id, exam_id) DO UPDATE SET marks = EXCLUDED.marks',
      [studentId, exam_id, marks]
    );
  }
};

const sendResultsSMS = async (data, examName, totalMarks) => {
  for (const record of data) {
    const { studentId, marks } = getRecordValues(record);
    if (!studentId || marks === undefined) continue;
    await smsService.sendExamResultSMS(studentId, examName, marks, totalMarks);
  }
};

const removeTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

exports.uploadExcelMarks = async (req, res) => {
  const filePath = req.file?.path || null;
  try {
    if (!filePath) throw new Error('කරුණාකර Excel ගොනුවක් තෝරන්න.');
    const { exam_id } = req.body;
    if (!exam_id) throw new Error('විභාගය තෝරා ගැනීම අනිවාර්ය වේ.');

    const data = await parseExcelData(filePath);
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await saveExamResults(client, data, exam_id);
      await client.query('COMMIT');

      const examDetails = await client.query('SELECT exam_name, total_marks FROM Exams WHERE exam_id = $1', [exam_id]);
      if (examDetails.rows.length === 0) {
        throw new Error('විභාගය සොයාගත නොහැකි විය.');
      }
      const { exam_name: examName, total_marks: totalMarks } = examDetails.rows[0];

      await sendResultsSMS(data, examName, totalMarks);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally { client.release(); }

    removeTempFile(filePath);
    res.json({ message: 'Excel දත්ත සාර්ථකව පද්ධතියට ඇතුළත් කළා!' });
  } catch (err) {
    removeTempFile(filePath);
    res.status(500).json({ error: err.message });
  }
};

// විභාගය සහ ඒ හා සම්බන්ධ සියලුම ලකුණු ඉවත් කිරීම
exports.deleteExam = async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. ප්‍රථමයෙන් එම විභාගයට අදාළ සියලුම ලකුණු (Results) ඉවත් කිරීම
    await client.query('DELETE FROM Exam_Results WHERE exam_id = $1', [id]);

    // 2. විභාගය (Exam) ඉවත් කිරීම
    const result = await client.query('DELETE FROM Exams WHERE exam_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      throw new Error('විභාගය සොයාගත නොහැකි විය.');
    }

    await client.query('COMMIT');
    res.json({ message: 'විභාගය සහ සියලුම ලකුණු සාර්ථකව පද්ධතියෙන් ඉවත් කළා!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Delete Exam Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// විභාගයක් යාවත්කාලීන කිරීම (සමඟින් validation)
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { exam_name, exam_date, total_marks, pass_percentage } = req.body;

  if (pass_percentage !== undefined && (pass_percentage < 0 || pass_percentage > 100)) {
    return res.status(400).json({ error: 'සමත් ප්‍රතිශතය 0 ත් 100 ත් අතර විය යුතුය.' });
  }

  try {
    // 1. පද්ධතියේ දැනටමත් ලකුණු ඇතුළත් කර ඇත්දැයි පරීක්ෂා කිරීම
    const checkResults = await db.pool.query('SELECT COUNT(*) FROM Exam_Results WHERE exam_id = $1', [id]);
    const hasResults = Number.parseInt(checkResults.rows[0].count, 10) > 0;

    if (hasResults) {
      // දැනට ඇති විභාග දත්ත ලබා ගැනීම
      const currentExam = await db.pool.query('SELECT total_marks FROM Exams WHERE exam_id = $1', [id]);
      
      if (currentExam.rows.length > 0 && currentExam.rows[0].total_marks !== Number.parseInt(total_marks, 10)) {
        return res.status(400).json({ 
          error: 'මෙම විභාගය සඳහා දැනටමත් ලකුණු ඇතුළත් කර ඇති බැවින් මුළු ලකුණු (Total Marks) වෙනස් කළ නොහැක.' 
        });
      }
    }

    const query = 'UPDATE Exams SET exam_name = $1, exam_date = $2, total_marks = $3, pass_percentage = $4 WHERE exam_id = $5 RETURNING *';
    const result = await db.pool.query(query, [exam_name, exam_date, total_marks, pass_percentage, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'විභාගය හමුවුනේ නැත.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};