const db = require('../db');
const auditService = require('../utils/auditService');
const smsService = require('../utils/smsService');

exports.recordPayment = async (req, res) => {
  const { student_id, course_id, amount_paid, payment_method, for_month, receipt_number } = req.body;
  
  // The ID of the Admin/Counter Staff who is logged in
  const issued_by = req.user.userId;

  if (!student_id || !course_id || !amount_paid || !for_month || !receipt_number) {
    return res.status(400).json({ message: "අත්‍යවශ්‍ය සියලුම දත්ත (ශිෂ්‍යයා, පන්තිය, මුදල, මාසය, රසීදු අංකය) ඇතුළත් කරන්න." });
  }

  try {
    const query = `
      INSERT INTO Payments (student_id, course_id, issued_by, amount_paid, payment_method, for_month, receipt_number, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Completed')
      RETURNING *
    `;
    const values = [student_id, course_id, issued_by, amount_paid, payment_method || 'Cash', for_month, receipt_number];
    
    const result = await db.pool.query(query, values);

    res.status(201).json({
      message: 'ගෙවීම සාර්ථකව සටහන් කරන ලදී.',
      payment: result.rows[0]
    });
    await auditService.logAction(issued_by, req.user.role, 'CREATE', 'Payment', result.rows[0].payment_id, `Recorded payment of Rs.${amount_paid} for student ${student_id} for ${for_month}.`);
  } catch (error) {
    console.error('❌ Payment Recording Error:', error.message);
    res.status(500).json({ message: "ගෙවීම් සටහන් කිරීම අසාර්ථකයි.", error: error.message });
  }
};

exports.getStudentPayments = async (req, res) => {
  const { studentId } = req.params;
  try {
    const query = `
      SELECT p.*, c.course_name, u.username as issued_by_name
      FROM Payments p
      JOIN Courses c ON p.course_id = c.course_id
      JOIN Users u ON p.issued_by = u.user_id
      WHERE p.student_id = $1
      ORDER BY p.payment_date DESC
    `;
    const result = await db.pool.query(query, [studentId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get Student Payments Error:', error.message);
    res.status(500).json({ message: "ගෙවීම් විස්තර ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};

// හිඟ මුදල් සහිත සිසුන් සොයා මතක් කිරීම් SMS යැවීම
exports.sendLatePaymentReminders = async (req, res) => {
  const { course_id, for_month } = req.body;

  if (!course_id || !for_month) {
    return res.status(400).json({ message: "පන්තිය සහ මාසය තෝරා ගැනීම අනිවාර්ය වේ." });
  }

  try {
    // 1. පන්තියට ඇතුළත් වූ නමුත් අදාළ මාසය සඳහා ගෙවීම් නොකළ සිසුන් සෙවීම
    const query = `
      SELECT s.student_id, s.student_name, p.parent_phone, p.parent_name, c.course_name
      FROM Course_Enrollments ce
      JOIN Students s ON ce.student_id = s.student_id
      JOIN Parents p ON s.parent_id = p.parent_id
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE ce.course_id = $1
        AND ce.enrollment_status = 'Enrolled'
        AND NOT EXISTS (
          SELECT 1 FROM Payments pay
          WHERE pay.student_id = ce.student_id
            AND pay.course_id = ce.course_id
            AND pay.for_month = $2
        )
    `;
    const result = await db.pool.query(query, [course_id, for_month]);

    // 2. එක් එක් ශිෂ්‍යයා සඳහා SMS යැවීම
    for (const student of result.rows) {
      await smsService.sendLatePaymentSMS(student.student_id, student.student_name, student.parent_phone, student.course_name, for_month);
    }

    res.json({ 
      message: `සාර්ථකයි! හිඟ මුදල් සහිත සිසුන් ${result.rows.length} දෙනෙකුගේ මව්පියන්ට මතක් කිරීමේ (Late Payment) SMS යවන ලදී.` 
    });
  } catch (error) {
    console.error('❌ Reminders Error:', error.message);
    res.status(500).json({ message: "මතක් කිරීම් යැවීමට නොහැකි විය.", error: error.message });
  }
};