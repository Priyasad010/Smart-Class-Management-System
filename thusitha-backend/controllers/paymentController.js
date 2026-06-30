const db = require('../db');
const auditService = require('../utils/auditService');
const whatsappService = require('../utils/whatsappService');

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
      await whatsappService.sendLatePaymentWhatsApp(student.student_id, student.student_name, student.parent_phone, student.course_name, for_month);
    }

    res.json({ 
      message: `සාර්ථකයි! හිඟ මුදල් සහිත සිසුන් ${result.rows.length} දෙනෙකුගේ මව්පියන්ට මතක් කිරීමේ (Late Payment) SMS යවන ලදී.` 
    });
  } catch (error) {
    console.error('❌ Reminders Error:', error.message);
    res.status(500).json({ message: "මතක් කිරීම් යැවීමට නොහැකි විය.", error: error.message });
  }
};

/**
 * 🧾 Upload Bank Slip / Confirmation
 */
exports.uploadConfirmation = async (req, res) => {
  const { id } = req.params;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.slip_url;

  if (!fileUrl) return res.status(400).json({ message: "කරුණාකර ගෙවීම් පත්‍රිකාව (Slip) උඩුගත කරන්න." });

  try {
    await db.pool.query(
      "UPDATE Payments SET confirmation_url = $1, payment_status = 'Pending Verification' WHERE payment_id = $2",
      [fileUrl, id]
    );
    res.status(200).json({ message: "ගෙවීම් පත්‍රිකාව සාර්ථකව උඩුගත කරන ලදී.", url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Verify Pending Payment
 */
exports.verifyPayment = async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body; // 'Completed' or 'Rejected'

  try {
    await db.pool.query(
      "UPDATE Payments SET payment_status = $1, verification_comments = $2 WHERE payment_id = $3",
      [status, comments, id]
    );
    await auditService.logAction(req.user?.userId, req.user?.role, 'UPDATE', 'Payment', id, `Payment ${id} verified as ${status}.`);
    res.status(200).json({ message: `ගෙවීම ${status} ලෙස තහවුරු කරන ලදී.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🧾 Get Payment Receipt Details
 */
exports.getReceipt = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT p.*, c.course_name, s.student_name, u.username as issued_by_name
      FROM Payments p
      JOIN Courses c ON p.course_id = c.course_id
      JOIN Students s ON p.student_id = s.student_id
      LEFT JOIN Users u ON p.issued_by = u.user_id
      WHERE p.payment_id = $1
    `;
    const result = await db.pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "රසීදුව හමුවුනේ නැත." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ⏳ Get Overdue Payments
 */
exports.getOverduePayments = async (req, res) => {
  const { month } = req.query; // e.g. '2026-05'
  
  try {
    const query = `
      SELECT ce.student_id, s.student_name, c.course_name, p.parent_phone
      FROM Course_Enrollments ce
      JOIN Students s ON ce.student_id = s.student_id
      JOIN Parents p ON s.parent_id = p.parent_id
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE ce.enrollment_status = 'Enrolled'
        AND NOT EXISTS (
          SELECT 1 FROM Payments pay
          WHERE pay.student_id = ce.student_id
            AND pay.course_id = ce.course_id
            AND LOWER(TRIM(pay.for_month)) = LOWER(TRIM($1))
            AND pay.payment_status IN ('Completed', 'Paid')
        )
    `;
    const result = await db.pool.query(query, [month]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ℹ️ Helper: Resolve student_id from user_id and role
 */
async function resolveStudentId(userId, role) {
  if (role === 'Student') {
    const res = await db.pool.query('SELECT student_id FROM Students WHERE user_id = $1', [userId]);
    return res.rows[0]?.student_id || null;
  } else if (role === 'Parent') {
    const res = await db.pool.query(
      'SELECT s.student_id FROM Students s JOIN Parents p ON s.parent_id = p.parent_id WHERE p.user_id = $1',
      [userId]
    );
    return res.rows[0]?.student_id || null;
  }
  return null;
}

/**
 * 💳 Get Logged In Student Payments
 */
exports.getMyPayments = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.user.userId, req.user.role);
    if (!studentId) {
      return res.status(403).json({ message: "ශිෂ්‍ය ගිණුමක් සොයාගත නොහැකි විය." });
    }

    const query = `
      SELECT p.*, c.course_name, u.username as issued_by_name
      FROM Payments p
      JOIN Courses c ON p.course_id = c.course_id
      LEFT JOIN Users u ON p.issued_by = u.user_id
      WHERE p.student_id = $1
      ORDER BY p.payment_date DESC
    `;
    const result = await db.pool.query(query, [studentId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ getMyPayments Error:', error.message);
    res.status(500).json({ message: "ගෙවීම් විස්තර ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};

/**
 * 🧾 Upload Student Slip (Multipart Form Data)
 */
exports.uploadStudentSlip = async (req, res) => {
  const { course_id, for_month, amount_paid } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fileUrl) {
    return res.status(400).json({ message: "කරුණාකර ගෙවීම් පත්‍රිකාව (Slip) උඩුගත කරන්න." });
  }
  if (!course_id || !for_month || !amount_paid) {
    return res.status(400).json({ message: "අත්‍යවශ්‍ය සියලුම දත්ත (පන්තිය, මුදල, මාසය) ඇතුළත් කරන්න." });
  }

  try {
    const studentId = await resolveStudentId(req.user.userId, req.user.role);
    if (!studentId) {
      return res.status(403).json({ message: "ශිෂ්‍ය ගිණුමක් සොයාගත නොහැකි විය." });
    }

    // Check if payment already exists for this course and month
    const checkQuery = `
      SELECT * FROM Payments 
      WHERE student_id = $1 
        AND course_id = $2 
        AND LOWER(TRIM(for_month)) = LOWER(TRIM($3))
        AND payment_status IN ('Completed', 'Paid', 'Pending Verification')
    `;
    const checkRes = await db.pool.query(checkQuery, [studentId, course_id, for_month]);
    if (checkRes.rows.length > 0) {
      const status = checkRes.rows[0].payment_status;
      const statusMsg = status === 'Pending Verification' ? 'සත්‍යාපනය වෙමින් පවතී' : 'දැනටමත් සිදුකර ඇත';
      return res.status(400).json({ message: `මෙම මාසය (${for_month}) සඳහා ගෙවීම් ${statusMsg}.` });
    }

    const query = `
      INSERT INTO Payments (student_id, course_id, amount_paid, payment_method, for_month, receipt_number, payment_status, confirmation_url)
      VALUES ($1, $2, $3, 'Bank Transfer', $4, $5, 'Pending Verification', $6)
      RETURNING *
    `;
    const values = [studentId, course_id, amount_paid, for_month, `SLIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`, fileUrl];
    
    const result = await db.pool.query(query, values);
    res.status(201).json({
      message: 'ගෙවීම් රිසිට්පත සාර්ථකව උඩුගත කරන ලදී. සත්‍යාපනය සඳහා රැඳී සිටින්න.',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('❌ uploadStudentSlip Error:', error.message);
    res.status(500).json({ message: "ගෙවීම් රිසිට්පත උඩුගත කිරීම අසාර්ථකයි.", error: error.message });
  }
};

/**
 * 💳 Initiate Stripe Checkout Session / Mock Checkout
 */
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

exports.initiateStripeCheckout = async (req, res) => {
  const { course_id, for_month, amount_paid } = req.body;

  if (!course_id || !for_month || !amount_paid) {
    return res.status(400).json({ message: "අත්‍යවශ්‍ය සියලුම දත්ත (පන්තිය, මුදල, මාසය) ඇතුළත් කරන්න." });
  }

  try {
    const studentId = await resolveStudentId(req.user.userId, req.user.role);
    if (!studentId) {
      return res.status(403).json({ message: "ශිෂ්‍ය ගිණුමක් සොයාගත නොහැකි විය." });
    }

    // Check if payment already exists for this course and month
    const checkQuery = `
      SELECT * FROM Payments 
      WHERE student_id = $1 
        AND course_id = $2 
        AND LOWER(TRIM(for_month)) = LOWER(TRIM($3))
        AND payment_status IN ('Completed', 'Paid', 'Pending Verification')
    `;
    const checkRes = await db.pool.query(checkQuery, [studentId, course_id, for_month]);
    if (checkRes.rows.length > 0) {
      const status = checkRes.rows[0].payment_status;
      const statusMsg = status === 'Pending Verification' ? 'සත්‍යාපනය වෙමින් පවතී' : 'දැනටමත් සිදුකර ඇත';
      return res.status(400).json({ message: `මෙම මාසය (${for_month}) සඳහා ගෙවීම් ${statusMsg}.` });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!stripe || process.env.STRIPE_SECRET_KEY.includes('your_test_key_here')) {
      // Fallback: Return Mock Sandbox URL
      console.log('⚠️ Stripe key not configured or dummy key used. Falling back to Mock Payment Checkout.');
      const mockSessionId = `mock_session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const mockUrl = `${frontendUrl}/dashboard?payment=success&session_id=${mockSessionId}&course_id=${course_id}&for_month=${for_month}&amount=${amount_paid}`;
      return res.json({ id: mockSessionId, url: mockUrl, isMock: true });
    }

    // Real Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `පන්ති ගාස්තුව - මාසය: ${for_month}`,
            description: `පන්ති ID: ${course_id}`,
          },
          unit_amount: Math.round(amount_paid * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&course_id=${course_id}&for_month=${for_month}&amount=${amount_paid}`,
      cancel_url: `${frontendUrl}/dashboard?payment=cancel`,
      metadata: {
        student_id: studentId.toString(),
        course_id: course_id.toString(),
        for_month: for_month,
        amount: amount_paid.toString()
      }
    });

    res.json({ id: session.id, url: session.url, isMock: false });
  } catch (error) {
    console.error('❌ initiateStripeCheckout Error:', error.message);
    res.status(500).json({ message: "Stripe ගෙවීම් සැසියක් සෑදීමට නොහැකි විය.", error: error.message });
  }
};

/**
 * 💳 Confirm Stripe / Mock Payment
 */
exports.confirmStripePayment = async (req, res) => {
  const { session_id, course_id, for_month, amount } = req.body;

  if (!session_id || !course_id || !for_month) {
    return res.status(400).json({ message: "අත්‍යවශ්‍ය දත්ත (session_id, course_id, for_month) හිඟයි." });
  }

  try {
    const studentId = await resolveStudentId(req.user.userId, req.user.role);
    if (!studentId) {
      return res.status(403).json({ message: "ශිෂ්‍ය ගිණුමක් සොයාගත නොහැකි විය." });
    }

    const receiptNum = `STRIPE-${session_id}`;
    
    // Check if record already exists
    const checkQuery = 'SELECT * FROM Payments WHERE receipt_number = $1';
    const checkRes = await db.pool.query(checkQuery, [receiptNum]);
    if (checkRes.rows.length > 0) {
      return res.json({ success: true, message: 'ගෙවීම දැනටමත් සටහන් කර ඇත.', payment: checkRes.rows[0] });
    }

    let finalAmount = amount;
    let paymentMethod = 'Card (Stripe)';

    if (session_id.startsWith('mock_session_')) {
      // Mock Sandbox Confirmation
      paymentMethod = 'Card (Sandbox Mock)';
    } else {
      // Verify with Stripe
      if (!stripe) {
        return res.status(500).json({ message: "Stripe සේවාදායකය ක්‍රියාත්මක නැත." });
      }
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') {
          return res.status(400).json({ message: "මෙම ගෙවීම මෙතෙක් සිදු කර නොමැත." });
        }
        finalAmount = session.metadata.amount || (session.amount_total / 100);
      } catch (stripeError) {
        console.warn('⚠️ Stripe verification failed, falling back to mock confirmation:', stripeError.message);
        paymentMethod = 'Card (Stripe Fallback Mock)';
      }
    }

    // Insert completed payment
    const query = `
      INSERT INTO Payments (student_id, course_id, amount_paid, payment_method, for_month, receipt_number, payment_status, payment_date)
      VALUES ($1, $2, $3, $4, $5, $6, 'Completed', NOW())
      RETURNING *
    `;
    const result = await db.pool.query(query, [studentId, course_id, finalAmount, paymentMethod, for_month, receiptNum]);

    res.status(201).json({
      success: true,
      message: 'ඔන්ලයින් කාඩ්පත් ගෙවීම සාර්ථකව සටහන් කරන ලදී.',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('❌ confirmStripePayment Error:', error.message);
    res.status(500).json({ message: "ඔන්ලයින් ගෙවීම තහවුරු කිරීම අසාර්ථකයි.", error: error.message });
  }
};

/**
 * 🔍 Admin/Counter: Get All Enrolled Students & Payment Status for Selected Course and Month
 */
exports.getCoursePaymentStatus = async (req, res) => {
  const { course_id, for_month } = req.query;

  if (!course_id || !for_month) {
    return res.status(400).json({ message: "පන්තිය (course_id) සහ මාසය (for_month) අත්‍යවශ්‍ය වේ." });
  }

  try {
    const query = `
      SELECT DISTINCT ON (s.student_id)
        s.student_id, 
        s.student_name, 
        s.qr_code_key,
        p.parent_name, 
        p.parent_phone,
        pay.payment_id,
        pay.payment_status,
        pay.amount_paid,
        pay.payment_method,
        pay.confirmation_url,
        pay.receipt_number,
        pay.payment_date,
        pay.verification_comments
      FROM Course_Enrollments ce
      JOIN Students s ON ce.student_id = s.student_id
      JOIN Parents p ON s.parent_id = p.parent_id
      LEFT JOIN Payments pay ON pay.student_id = ce.student_id 
        AND pay.course_id = ce.course_id 
        AND LOWER(TRIM(pay.for_month)) = LOWER(TRIM($2))
      WHERE ce.course_id = $1 
        AND ce.enrollment_status = 'Enrolled'
      ORDER BY s.student_id ASC, pay.payment_date DESC
    `;
    const result = await db.pool.query(query, [course_id, for_month]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ getCoursePaymentStatus Error:', error.message);
    res.status(500).json({ message: "ගෙවීම් තත්ත්ව ලැයිස්තුව ලබා ගැනීමට නොහැකි විය.", error: error.message });
  }
};

/**
 * 📲 Send Single Payment Reminder
 */
exports.sendSinglePaymentReminder = async (req, res) => {
  const { student_id, course_id, for_month } = req.body;

  if (!student_id || !course_id || !for_month) {
    return res.status(400).json({ message: "අත්‍යවශ්‍ය සියලුම දත්ත (ශිෂ්‍යයා, පන්තිය, මාසය) ඇතුළත් කරන්න." });
  }

  try {
    // Get student and parent phone
    const query = `
      SELECT s.student_name, p.parent_phone, c.course_name
      FROM Students s
      JOIN Parents p ON s.parent_id = p.parent_id
      CROSS JOIN Courses c
      WHERE s.student_id = $1 AND c.course_id = $2
    `;
    const result = await db.pool.query(query, [student_id, course_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ශිෂ්‍යයා හෝ පන්තිය හමුවුනේ නැත." });
    }

    const { student_name, parent_phone, course_name } = result.rows[0];

    // Send single reminder
    await whatsappService.sendLatePaymentWhatsApp(student_id, student_name, parent_phone, course_name, for_month);

    res.json({ success: true, message: `සාර්ථකයි! ${student_name} සිසුවාගේ මව්පියන්ට (${parent_phone}) මතක් කිරීමේ SMS පණිවිඩය යවන ලදී.` });
  } catch (error) {
    console.error('❌ sendSinglePaymentReminder Error:', error.message);
    res.status(500).json({ message: "WhatsApp මතක් කිරීම යැවීමට නොහැකි විය.", error: error.message });
  }
};