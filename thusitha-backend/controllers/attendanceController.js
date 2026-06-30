const db = require('../db');
const path = require('node:path');
const smsService = require('../utils/smsService');
const auditService = require('../utils/auditService');
const axios = require('axios'); // Added axios for microservice calls

/**
 * 💡 Helper: Executes the AI Python microservice via HTTP
 */
async function runAIProcess(mode, inputData) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
    if (mode === 'status') {
      const response = await axios.get(`${FASTAPI_URL}/status`);
      return response.data;
    }
    const response = await axios.post(`${FASTAPI_URL}/${mode}`, inputData);
    if (response.data.error && !response.data.fallback_active) {
       throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(`AI Microservice Error: ${error.message}`);
  }
}

exports.runAIProcess = runAIProcess;

/**
 * 🛡️ Industrial Logic: Handles QR code scanning and triggers automatic SMS.
 */
exports.markAttendanceByQR = async (req, res) => {
  const { qr_code_key, course_id } = req.body;

  if (!qr_code_key || !course_id) {
    return res.status(400).json({ message: "QR Key සහ Course ID අත්‍යවශ්‍ය වේ." });
  }

  try {
    // 1. ශිෂ්‍යයා සොයා ගැනීම
    const studentRes = await db.pool.query('SELECT student_id, student_name FROM Students WHERE qr_code_key = $1', [qr_code_key]);
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "ශිෂ්‍යයා හමුවුනේ නැත." });
    }
    const student = studentRes.rows[0];

    // 2. පන්තිය සොයා ගැනීම
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const courseRes = await db.pool.query(
      'SELECT c.course_name, cs.start_time FROM Courses c JOIN Class_Schedules cs ON c.course_id = cs.course_id WHERE c.course_id = $1 AND cs.day_of_week = $2', 
      [course_id, dayOfWeek]
    );
    const course = courseRes.rows[0];
    const courseName = course?.course_name || "General Class";
    const startTime = course?.start_time; // Expecting format 'HH:MM:SS' from DB

    // 💡 Industrial Logic: Determine if student is 'Late' (15 min threshold)
    let attendanceStatus = 'Present';
    if (startTime) {
      const now = new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      const classStartToday = new Date();
      classStartToday.setHours(hours, minutes, 0, 0);

      // Fetching the late threshold dynamically (defaulting to 15 if not set)
      const settingsRes = await db.pool.query("SELECT setting_value FROM System_Settings WHERE setting_key = 'late_threshold_minutes'");
      const thresholdMinutes = settingsRes.rows[0]?.setting_value ? Number.parseInt(settingsRes.rows[0].setting_value, 10) : 15;

      const lateThreshold = new Date(classStartToday.getTime() + thresholdMinutes * 60 * 1000); 
      if (now > lateThreshold) {
        attendanceStatus = 'Late';
      }
    }

    // 3. දැනටමත් පැමිණීම සටහන් කර ඇත්දැයි බැලීම (Duplicate Prevention)
    const checkQuery = `
      SELECT 1 FROM Student_Attendance_Logs 
      WHERE student_id = $1 AND course_id = $2 AND DATE(scanned_at) = CURRENT_DATE
    `;
    const existing = await db.pool.query(checkQuery, [student.student_id, course_id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "අද දින සඳහා පැමිණීම දැනටමත් සටහන් කර ඇත." });
    }

    // 4. පැමිණීම සටහන් කිරීම
    const recordQuery = `
      INSERT INTO Student_Attendance_Logs (student_id, course_id, attendance_status, scanned_at)
      VALUES ($1, $2, $3, NOW()) RETURNING scanned_at
    `;
    const result = await db.pool.query(recordQuery, [student.student_id, course_id, attendanceStatus]);
    const scannedAt = result.rows[0].scanned_at;
    const timeString = new Date(scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 5. ස්වයංක්‍රීයව SMS යැවීම
    await smsService.sendAttendanceSMS(student.student_id, courseName, timeString, attendanceStatus);

    res.status(201).json({ message: `පැමිණීම (${attendanceStatus === 'Late' ? 'ප්‍රමාද' : 'පැමිණි'}) ලෙස සටහන් වූ අතර මව්පියන්ට SMS පණිවිඩයක් යවන ලදී.`, student_name: student.student_name });
  } catch (error) {
    console.error('❌ QR Attendance Error:', error.message);
    res.status(500).json({ error: 'පැමිණීම සටහන් කිරීම අසාර්ථකයි.' });
  }
};

/**
 * 🛡️ Zoned Validation Logic (The "1,000 Student Solution")
 * Aggregates headcount from multiple zone cameras and compares to QR data.
 */
exports.validateAttendanceWithZones = async (req, res) => {
  const { session_id, hall_id } = req.body;

  if (!session_id || !hall_id) {
    return res.status(400).json({ message: "Session ID සහ Hall ID අත්‍යවශ්‍ය වේ." });
  }

  try {
    // 1. Get all camera zones for this hall (Front, Middle, Back)
    const zonesRes = await db.pool.query(
      'SELECT * FROM Camera_Zones WHERE hall_id = $1 ORDER BY position ASC',
      [hall_id]
    );
    const zones = zonesRes.rows;

    if (zones.length === 0) {
      return res.status(404).json({ message: "මෙම ශාලාව සඳහා කැමරා කලාප (Zones) සකසා නැත." });
    }

    // 2. Pass 1: Headcount (Fast YOLO Count)
    const headcountResult = await runAIProcess('headcount', { zones });
    const zoneResults = headcountResult.zone_breakdown;
    const totalAIHeadcount = headcountResult.total_ai_headcount;

    // 3. Get actual QR scan count from door logs for the specific session
    const qrCountRes = await db.pool.query(
      `SELECT COUNT(DISTINCT student_id) FROM Student_Attendance_Logs 
       WHERE course_id = (SELECT course_id FROM Class_Schedules WHERE schedule_id = $1) 
       AND DATE(scanned_at) = CURRENT_DATE`,
      [session_id]
    );
    const qrCount = Number.parseInt(qrCountRes.rows[0].count, 10);

    // 💡 Fetching the AI mismatch threshold dynamically (defaulting to 5 if not set in System_Settings)
    const settingsRes = await db.pool.query("SELECT setting_value FROM System_Settings WHERE setting_key = 'ai_mismatch_threshold'");
    const aiThreshold = settingsRes.rows[0]?.setting_value ? Number.parseInt(settingsRes.rows[0].setting_value, 10) : 5;

    // 4. Mismatch Detection (Triggered if difference > dynamic threshold)
    const mismatchDetected = Math.abs(totalAIHeadcount - qrCount) > aiThreshold;

    let verificationData = null;
    if (true) { // Run face verification pass always to draw and return the annotated snapshot in UI
      // 💡 Pass 2: Face Verification (Triggered only on Mismatch)
      // Now fetching PRE-CALCULATED encodings instead of image paths
      const studentsRes = await db.pool.query(
        `SELECT s.student_id, s.student_name, s.face_encoding 
         FROM Students s
         JOIN Student_Attendance_Logs sal ON s.student_id = sal.student_id
         WHERE sal.course_id = (SELECT course_id FROM Class_Schedules WHERE schedule_id = $1)
         AND DATE(sal.scanned_at) = CURRENT_DATE`,
        [session_id]
      );

      // Execute verification pass
      const verificationResult = await runAIProcess('verify', { 
        zones, 
        expected_students: studentsRes.rows,
        session_id
      });

      // Identify "Unverified" students (Scanned but not seen in any camera zone)
      const allMatchedIds = [];
      Object.values(verificationResult.verification_details).forEach(zone => {
        allMatchedIds.push(...zone.matched_student_ids);
      });
      
      const uniqueMatchedIds = new Set(allMatchedIds);
      const unverified = studentsRes.rows.filter(s => !uniqueMatchedIds.has(s.student_id));
      
      // Extract image paths from zone details
      const suspiciousImages = {};
      Object.entries(verificationResult.verification_details).forEach(([zone, details]) => {
        if (details.image_url) suspiciousImages[zone] = details.image_url;
      });

      verificationData = {
        unverified_students: unverified.map(s => ({ id: s.student_id, name: s.student_name })),
        zone_details: verificationResult.verification_details,
        image_paths: suspiciousImages
      };
    }

    // 5. Update Master Record with JSON breakdown
    const masterQuery = `
      INSERT INTO Attendance_Master (session_id, qr_count, ai_headcount, zone_details, mismatch_detected, verification_data, validated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (session_id) 
      DO UPDATE SET qr_count = $2, ai_headcount = $3, zone_details = $4, mismatch_detected = $5, verification_data = $6, validated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    await db.pool.query(masterQuery, [session_id, qrCount, totalAIHeadcount, JSON.stringify(zoneResults), mismatchDetected, JSON.stringify(verificationData)]);

    // 📋 Log Discrepancy for Audit if mismatch detected
    if (mismatchDetected) {
      await auditService.logAction(req.user?.userId, req.user?.role, 'ALERT', 'Attendance', session_id, `Attendance mismatch: QR ${qrCount} vs AI ${totalAIHeadcount}`);

      // 🛡️ record detailed entry in Suspicious Activity Log
      const suspiciousQuery = `
        INSERT INTO Suspicious_Attendance_Logs (session_id, qr_count, ai_headcount, zone_details, unverified_student_ids, image_paths, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      `;
      const unverifiedIds = verificationData?.unverified_students?.map(s => s.id) || [];
      await db.pool.query(suspiciousQuery, [session_id, qrCount, totalAIHeadcount, JSON.stringify(zoneResults), JSON.stringify(unverifiedIds), JSON.stringify(verificationData?.image_paths || {})]);
    }

    res.status(200).json({
      message: mismatchDetected ? '⚠️ විසංවාදයක් (Mismatch) හමුවිය!' : '✅ පැමිණීම තහවුරුයි.',
      data: {
        qr_count: qrCount, ai_headcount: totalAIHeadcount,
        mismatch_detected: mismatchDetected, zone_breakdown: zoneResults, verification_data: verificationData
      }
    });

  } catch (error) {
    console.error('❌ Zoned Attendance Error:', error.message);
    res.status(500).json({ error: 'කලාපීය පැමිණීම පරීක්ෂා කිරීම අසාර්ථකයි.' });
  }
};

/**
 * 🛡️ Retrieves historical discrepancy logs for Admin review.
 */
exports.getSuspiciousLogs = async (req, res) => {
  const { startDate, endDate } = req.query;
  let query = `
    SELECT sl.*, c.course_name as class_name 
    FROM Suspicious_Attendance_Logs sl 
    JOIN Class_Schedules cs ON sl.session_id = cs.schedule_id
    JOIN Courses c ON cs.course_id = c.course_id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    params.push(startDate);
    query += ` AND sl.detected_at >= $${params.length}::date`;
  }
  if (endDate) {
    params.push(endDate);
    query += ` AND sl.detected_at <= $${params.length}::date + INTERVAL '1 day'`;
  }

  query += ` ORDER BY sl.detected_at DESC`;

  try {
    const result = await db.pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Suspicious logs retrieval error:', err);
    res.status(500).json({ error: 'විසංවාද වාර්තා ලබා ගැනීමට නොහැකි විය.' });
  }
};

/**
 * 🛠️ Bulk resolves discrepancy logs (System Audit helper).
 */
exports.bulkResolveLogs = async (req, res) => {
  const { logIds, comment } = req.body;
  if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
    return res.status(400).json({ message: "නිරාකරණය කිරීමට වාර්තා තෝරා නොමැත." });
  }

  try {
    await db.pool.query(
      "UPDATE Suspicious_Attendance_Logs SET status = 'Resolved', resolution_comment = $1 WHERE log_id = ANY($2)",
      [comment || 'Resolved via System Audit', logIds]
    );
    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Suspicious_Log', null, `Bulk resolved ${logIds.length} logs.`);
    res.json({ message: `වාර්තා ${logIds.length} ක් සාර්ථකව නිරාකරණය කළා!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Resolves a discrepancy log with Admin comments.
 */
exports.resolveLog = async (req, res) => {
  const { logId } = req.params;
  const { comment } = req.body;
  try {
    await db.pool.query(
      "UPDATE Suspicious_Attendance_Logs SET status = 'Resolved', resolution_comment = $1 WHERE log_id = $2",
      [comment, logId]
    );
    await auditService.logAction(req.user.userId, req.user.role, 'UPDATE', 'Suspicious_Log', logId, 'Resolved discrepancy.');
    res.json({ message: "විසංවාදය සාර්ථකව නිරාකරණය කළා!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📊 Get Study Area Occupancy per Hour for HomeTab.
 */
exports.getLibraryOccupancyStats = async (req, res) => {
  try {
    const query = `
      SELECT TO_CHAR(actual_arrival_time, 'HH24:00') AS hour, COUNT(*) AS count
      FROM Study_Area_Bookings
      WHERE actual_arrival_time >= CURRENT_DATE
      GROUP BY hour ORDER BY hour;
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * 🔔 Sends an SMS alert to parents when a face verification discrepancy is found.
 */
exports.sendDiscrepancyAlert = async (req, res) => {
  const { student_id, session_id } = req.body;

  if (!student_id || !session_id) {
    return res.status(400).json({ message: "Student ID සහ Session ID අත්‍යවශ්‍ය වේ." });
  }

  try {
    const query = `
      SELECT s.student_name, p.parent_phone, c.course_name 
      FROM Students s 
      JOIN Parents p ON s.parent_id = p.parent_id 
      JOIN Course_Enrollments ce ON s.student_id = ce.student_id
      JOIN Courses c ON ce.course_id = c.course_id
      JOIN Class_Schedules cs ON c.course_id = cs.course_id
      WHERE s.student_id = $1 AND cs.schedule_id = $2
      LIMIT 1
    `;
    const result = await db.pool.query(query, [student_id, session_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ශිෂ්‍යයාගේ හෝ පන්තියේ විස්තර සොයාගත නොහැකි විය." });
    }

    const { student_name, parent_phone, course_name } = result.rows[0];

    // We assume smsService.sendDiscrepancySMS is implemented in your smsService utility
    await smsService.sendDiscrepancySMS(parent_phone, student_name, course_name);

    res.status(200).json({ message: "මව්පියන්ට සාර්ථකව දැනුම් දෙන ලදී." });
  } catch (error) {
    console.error('❌ Discrepancy SMS Error:', error.message);
    res.status(500).json({ error: 'SMS යැවීම අසාර්ථකයි.' });
  }
};

/**
 * 🔔 Sends bulk SMS alerts to parents when multiple discrepancies are found.
 */
exports.bulkSendDiscrepancyAlerts = async (req, res) => {
  const { student_ids, session_id } = req.body;

  if (!student_ids || !Array.isArray(student_ids) || !session_id) {
    return res.status(400).json({ message: "Student IDs ලැයිස්තුව සහ Session ID අත්‍යවශ්‍ය වේ." });
  }

  try {
    const query = `
      SELECT s.student_id, s.student_name, p.parent_phone, c.course_name 
      FROM Students s 
      JOIN Parents p ON s.parent_id = p.parent_id 
      JOIN Course_Enrollments ce ON s.student_id = ce.student_id
      JOIN Courses c ON ce.course_id = c.course_id
      JOIN Class_Schedules cs ON c.course_id = cs.course_id
      WHERE s.student_id = ANY($1) AND cs.schedule_id = $2
    `;
    const result = await db.pool.query(query, [student_ids, session_id]);

    let sentCount = 0;
    for (const row of result.rows) {
      // Note: In production, consider using a queue for massive numbers of SMS
      await smsService.sendDiscrepancySMS(row.parent_phone, row.student_name, row.course_name);
      sentCount++;
    }

    res.status(200).json({ message: `${sentCount} දෙනෙකුගේ මව්පියන්ට සාර්ථකව දැනුම් දෙන ලදී.` });
  } catch (error) {
    console.error('❌ Bulk Discrepancy SMS Error:', error.message);
    res.status(500).json({ error: 'Bulk SMS යැවීම අසාර්ථකයි.' });
  }
};

/**
 * 📊 Get Total Suspicious Incidents for HomeTab.
 */
exports.getTotalSuspiciousIncidents = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved
      FROM Suspicious_Attendance_Logs;
    `;
    const result = await db.pool.query(query);
    res.json({ 
      pending: Number(result.rows[0].pending), 
      resolved: Number(result.rows[0].resolved) 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * 🌡️ Get Real-time Hall Occupancy for Heat Map.
 * Aggregates student arrivals per hall per hour.
 */
exports.getHallOccupancyStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        h.hall_name, 
        TO_CHAR(sal.scanned_at, 'HH24:00') AS hour, 
        COUNT(*) AS count
      FROM Student_Attendance_Logs sal
      JOIN Class_Schedules cs ON sal.course_id = cs.course_id
      JOIN Halls h ON cs.hall_id = h.hall_id
      WHERE DATE(sal.scanned_at) = CURRENT_DATE
      GROUP BY h.hall_name, hour
      ORDER BY h.hall_name, hour;
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * 🚨 Get Currently Active Congestions.
 * Returns halls that are currently being tracked for over-capacity.
 */
exports.getActiveCongestions = async (req, res) => {
  try {
    const query = `
      SELECT h.hall_name, (EXTRACT(EPOCH FROM (NOW() - ct.first_detected_at))/60)::INT as minutes_congested
      FROM Hall_Congestion_Tracker ct
      JOIN Halls h ON ct.hall_id = h.hall_id
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * 🔔 Hall Safety Drill Mode.
 * Sends a test SMS to all registered staff phone numbers.
 */
exports.triggerSafetyDrill = async (req, res) => {
  try {
    const settingsRes = await db.pool.query("SELECT setting_value FROM System_Settings WHERE setting_key = 'safety_staff_phones'");
    const staffPhones = (settingsRes.rows[0]?.setting_value || '').split(',');

    const message = "🧪 [SAFETY DRILL] This is a test alert from the Thusitha Smart Class Congestion Monitoring System. Please acknowledge receipt.";
    
    for (const phone of staffPhones) {
      if (phone.trim()) await smsService.sendCustomSMS(phone.trim(), message);
    }

    res.json({ message: "Safety Drill සාර්ථකව ආරම්භ කළා! සියලුම කාර්ය මණ්ඩලයට WhatsApp පණිවිඩ යවන ලදී." });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

/**
 * Helper: Handle over-capacity hall congestion
 */
const handleOverCapacityHall = async (hall, tracker, thresholdMinutes, staffPhones) => {
  if (tracker.rows.length === 0) {
    // First time detecting over-capacity
    await db.pool.query('INSERT INTO Hall_Congestion_Tracker (hall_id, first_detected_at) VALUES ($1, NOW())', [hall.hall_id]);
  } else {
    const { first_detected_at, sms_sent } = tracker.rows[0];
    const diffMinutes = (Date.now() - new Date(first_detected_at).getTime()) / (1000 * 60);

    if (diffMinutes >= thresholdMinutes && !sms_sent) {
      await notifyStaffOfCongestion(hall, thresholdMinutes, staffPhones, first_detected_at);
    }
  }
};

/**
 * Helper: Send congestion notifications to staff
 */
const notifyStaffOfCongestion = async (hall, thresholdMinutes, staffPhones, firstDetectedAt) => {
  console.log(`🚨 [Alert] Hall ${hall.hall_name} is congested! Sending SMS to staff.`);
  
  const message = `🚨 CONGESTION ALERT: Hall ${hall.hall_name} has ${hall.current_count} students (Capacity: ${hall.capacity}). Over-capacity for ${thresholdMinutes}+ minutes.`;
  
  for (const phone of staffPhones) {
    await smsService.sendCustomSMS(phone.trim(), message); 
  }

  const logRes = await db.pool.query(
    'INSERT INTO Hall_Congestion_Logs (hall_id, peak_count, capacity, started_at) VALUES ($1, $2, $3, $4) RETURNING log_id',
    [hall.hall_id, hall.current_count, hall.capacity, firstDetectedAt]
  );
  
  await db.pool.query('UPDATE Hall_Congestion_Tracker SET sms_sent = TRUE, active_log_id = $1 WHERE hall_id = $2', [logRes.rows[0].log_id, hall.hall_id]);
};

/**
 * Helper: Handle safe capacity hall
 */
const handleSafeCapacityHall = async (hallId) => {
  const tracker = await db.pool.query('SELECT active_log_id FROM Hall_Congestion_Tracker WHERE hall_id = $1', [hallId]);
  if (tracker.rows[0]?.active_log_id) {
    await db.pool.query(
      'UPDATE Hall_Congestion_Logs SET ended_at = NOW(), duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at))/60 WHERE log_id = $1',
      [tracker.rows[0].active_log_id]
    );
  }
  await db.pool.query('DELETE FROM Hall_Congestion_Tracker WHERE hall_id = $1', [hallId]);
};

/**
 * 🚨 Automated Safety Check: Detects and notifies staff of hall congestion.
 * Triggers if a hall is over-capacity for more than 30 minutes.
 */
exports.processCongestionWarnings = async () => {
  try {
    // 1. Get current occupancy and capacity for all halls with active classes
    const statusQuery = `
      SELECT h.hall_id, h.hall_name, h.capacity, COUNT(sal.log_id) as current_count
      FROM Halls h
      JOIN Class_Schedules cs ON h.hall_id = cs.hall_id
      JOIN Student_Attendance_Logs sal ON cs.course_id = sal.course_id
      WHERE DATE(sal.scanned_at) = CURRENT_DATE
        AND CURRENT_TIME BETWEEN cs.start_time AND cs.end_time
      GROUP BY h.hall_id, h.hall_name, h.capacity;
    `;
    const { rows } = await db.pool.query(statusQuery);

    // 💡 Fetch dynamic safety thresholds and contact info
    const settingsRes = await db.pool.query("SELECT setting_key, setting_value FROM System_Settings WHERE setting_key IN ('safety_congestion_threshold', 'safety_staff_phones')");
    const settingsMap = Object.fromEntries(settingsRes.rows.map(s => [s.setting_key, s.setting_value]));
    const thresholdMinutes = Number.parseInt(settingsMap.safety_congestion_threshold || '30', 10);
    const staffPhones = (settingsMap.safety_staff_phones || '0771234567').split(',');

    for (const hall of rows) {
      const isOverCapacity = hall.current_count > hall.capacity;

      if (isOverCapacity) {
        const tracker = await db.pool.query('SELECT * FROM Hall_Congestion_Tracker WHERE hall_id = $1', [hall.hall_id]);
        await handleOverCapacityHall(hall, tracker, thresholdMinutes, staffPhones);
      } else {
        await handleSafeCapacityHall(hall.hall_id);
      }
    }
  } catch (error) {
    console.error('❌ Congestion processing error:', error.message);
  }
};

/**
 * 🔮 Get Predictive Library Occupancy based on historical averages.
 */
exports.getPredictiveOccupancy = async (req, res) => {
  try {
    const query = `
      SELECT hour, ROUND(AVG(cnt)) AS predicted_count
      FROM (
        SELECT TO_CHAR(actual_arrival_time, 'HH24:00') AS hour, COUNT(*) AS cnt, actual_arrival_time::date AS d
        FROM Study_Area_Bookings
        WHERE actual_arrival_time IS NOT NULL
        GROUP BY d, hour
      ) sub
      GROUP BY hour ORDER BY hour;
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateAIHeadcount = async (req, res) => {
  const { session_id, ai_headcount } = req.body;

  if (!session_id || ai_headcount === undefined) {
    return res.status(400).json({ message: "Session ID සහ Headcount අත්‍යවශ්‍ය වේ." });
  }

  try {
    // 1. Get the current QR scan count from the logs
    const qrCountRes = await db.pool.query(
      'SELECT COUNT(*) FROM Student_Attendance_Logs WHERE attendance_master_id IN (SELECT attendance_master_id FROM Attendance_Master WHERE session_id = $1)',
      [session_id]
    );
    const qrCount = Number.parseInt(qrCountRes.rows[0].count, 10);

    // 2. Check for mismatch (Threshold logic)
    // If AI headcount is higher than QR count, someone might be attending without scanning (Proxy)
    const mismatchDetected = ai_headcount > qrCount;

    // 3. Update or Insert into Attendance_Master
    const query = `
      INSERT INTO Attendance_Master (session_id, qr_count, ai_headcount, mismatch_detected, validated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (session_id) 
      DO UPDATE SET qr_count = $2, ai_headcount = $3, mismatch_detected = $4, validated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await db.pool.query(query, [session_id, qrCount, ai_headcount, mismatchDetected]);

    res.status(200).json({
      message: 'AI Headcount updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ AI Attendance Error:', error.message);
    res.status(500).json({ error: 'AI දත්ත යාවත්කාලීන කිරීම අසාර්ථකයි.' });
  }
};

exports.getAttendanceMaster = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const result = await db.pool.query('SELECT * FROM Attendance_Master WHERE session_id = $1', [sessionId]);
    res.status(200).json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📊 Get Overall AI Validation Success Rate for Dashboard.
 */
exports.getAIHealthStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE mismatch_detected = FALSE) as success_count,
        COUNT(*) FILTER (WHERE mismatch_detected = TRUE) as mismatch_count
      FROM Attendance_Master
    `;
    const statsRes = await db.pool.query(query);
    let aiStatus;
    try {
      aiStatus = await runAIProcess('status', {});
    } catch (aiErr) {
      aiStatus = {
        yolo_loaded: false,
        face_rec_enabled: false,
        device: 'Unavailable',
        error: aiErr.message || 'AI engine is offline'
      };
    }
    const stats = statsRes.rows[0];
    
    const successRate = stats.total_sessions > 0 
      ? (Number(stats.success_count) / Number(stats.total_sessions) * 100).toFixed(1) 
      : 100;

    res.json({
      total_sessions: Number(stats.total_sessions),
      success_count: Number(stats.success_count),
      mismatch_count: Number(stats.mismatch_count),
      success_rate: successRate,
      engine_status: aiStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// NEW MISSING ENDPOINTS ADDED IN PHASE 1
// -------------------------------------------------------------

/**
 * 📷 Trigger CCTV Occupancy Check (Stand-alone endpoint for /headcount)
 */
exports.checkCCTVOccupancy = async (req, res) => {
  const { hall_id } = req.body;
  if (!hall_id) return res.status(400).json({ message: "hall_id අත්‍යවශ්‍ය වේ." });
  
  try {
    const zonesRes = await db.pool.query('SELECT * FROM Camera_Zones WHERE hall_id = $1 ORDER BY position ASC', [hall_id]);
    if (zonesRes.rows.length === 0) return res.status(404).json({ message: "මෙම ශාලාව සඳහා කැමරා කලාප (Zones) සකසා නැත." });
    
    // Call AI process directly for just headcount
    const headcountResult = await runAIProcess('headcount', { zones: zonesRes.rows });
    res.status(200).json({ message: "CCTV Occupancy සාර්ථකයි", data: headcountResult });
  } catch (err) {
    console.error('❌ CCTV Occupancy Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🕒 Get Specific Session Attendance
 */
exports.getSessionAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const masterRes = await db.pool.query('SELECT * FROM Attendance_Master WHERE session_id = $1', [id]);
    const logsRes = await db.pool.query('SELECT sal.*, s.student_name FROM Student_Attendance_Logs sal JOIN Students s ON sal.student_id = s.student_id WHERE course_id = (SELECT course_id FROM Class_Schedules WHERE schedule_id = $1) AND DATE(scanned_at) = CURRENT_DATE', [id]);
    
    res.status(200).json({
      master_record: masterRes.rows[0] || null,
      student_logs: logsRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📅 Get Daily Attendance Reports
 */
exports.getDailyReports = async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const query = `
      SELECT h.hall_name, c.course_name, COUNT(sal.log_id) as present_count
      FROM Student_Attendance_Logs sal
      JOIN Courses c ON sal.course_id = c.course_id
      JOIN Class_Schedules cs ON c.course_id = cs.course_id
      JOIN Halls h ON cs.hall_id = h.hall_id
      WHERE DATE(sal.scanned_at) = $1
      GROUP BY h.hall_name, c.course_name
    `;
    const result = await db.pool.query(query, [date]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📆 Get Monthly Attendance Reports
 */
exports.getMonthlyReports = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || (new Date().getMonth() + 1);
  try {
    const query = `
      SELECT DATE(scanned_at) as date, COUNT(log_id) as daily_total
      FROM Student_Attendance_Logs
      WHERE EXTRACT(YEAR FROM scanned_at) = $1 AND EXTRACT(MONTH FROM scanned_at) = $2
      GROUP BY DATE(scanned_at)
      ORDER BY DATE(scanned_at)
    `;
    const result = await db.pool.query(query, [year, month]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✏️ Manual Attendance Correction
 */
exports.manualCorrection = async (req, res) => {
  const { logId } = req.params;
  const { attendance_status, reason } = req.body;
  
  if (!attendance_status) return res.status(400).json({ message: "attendance_status අවශ්‍ය වේ." });
  
  try {
    await db.pool.query('UPDATE Student_Attendance_Logs SET attendance_status = $1 WHERE log_id = $2', [attendance_status, logId]);
    await auditService.logAction(req.user?.userId, req.user?.role, 'UPDATE', 'Attendance_Log', logId, `Manual correction to ${attendance_status}. Reason: ${reason || 'Not provided'}`);
    res.status(200).json({ message: "පැමිණීම සාර්ථකව වෙනස් කරන ලදී." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟢 Lightweight Polling Endpoint for SmartAttendanceLivePanel
 */
exports.getLiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query('SELECT qr_count, ai_headcount, mismatch_detected, zone_details FROM Attendance_Master WHERE session_id = $1', [id]);
    
    // Also return the dynamic threshold
    const settingsRes = await db.pool.query("SELECT setting_value FROM System_Settings WHERE setting_key = 'ai_mismatch_threshold'");
    const aiThreshold = settingsRes.rows[0]?.setting_value ? Number.parseInt(settingsRes.rows[0].setting_value, 10) : 5;

    if (result.rows.length === 0) {
      return res.status(200).json({
        qr_count: 0, ai_headcount: 0, mismatch_detected: false, zone_breakdown: {}, threshold: aiThreshold
      });
    }

    const data = result.rows[0];
    
    // Parse zone_details safely
    let parsedZones = {};
    if (data.zone_details) {
      try {
        parsedZones = typeof data.zone_details === 'string' ? JSON.parse(data.zone_details) : data.zone_details;
      } catch (e) {
        parsedZones = {};
      }
    }

    res.status(200).json({
      qr_count: data.qr_count,
      ai_headcount: data.ai_headcount,
      mismatch_detected: data.mismatch_detected,
      zone_breakdown: parsedZones,
      threshold: aiThreshold
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 💾 Bulk Save Manual Attendance
 */
exports.saveManualAttendance = async (req, res) => {
  const { course_id, records, date } = req.body;
  if (!course_id || !records || !Array.isArray(records)) {
    return res.status(400).json({ message: "Course ID සහ පැමිණීම් වාර්තා අවශ්‍ය වේ." });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetTimestamp = date ? `${date} 08:00:00` : new Date().toISOString();

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    for (const record of records) {
      const studentId = record.student;
      const status = record.status; // 'Present' or 'Absent'

      // Check if student exists
      const studentRes = await client.query('SELECT 1 FROM Students WHERE student_id = $1', [studentId]);
      if (studentRes.rows.length === 0) continue;

      if (status === 'Present') {
        // Check if attendance already logged for today/targetDate
        const checkRes = await client.query(
          'SELECT 1 FROM Student_Attendance_Logs WHERE student_id = $1 AND course_id = $2 AND DATE(scanned_at) = $3',
          [studentId, course_id, targetDate]
        );
        if (checkRes.rows.length === 0) {
          await client.query(
            'INSERT INTO Student_Attendance_Logs (student_id, course_id, attendance_status, scanned_at) VALUES ($1, $2, $3, $4)',
            [studentId, course_id, 'Present', targetTimestamp]
          );
        }
      } else {
        // If status is Absent, delete any log for today/targetDate
        await client.query(
          'DELETE FROM Student_Attendance_Logs WHERE student_id = $1 AND course_id = $2 AND DATE(scanned_at) = $3',
          [studentId, course_id, targetDate]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: "පැමිණීම සාර්ථකව සුරැකුණි!" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Save Manual Attendance Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * 📅 Get Today's Student Attendance Logs by Course ID
 */
exports.getTodayLogsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const query = `
      SELECT student_id, attendance_status 
      FROM Student_Attendance_Logs 
      WHERE course_id = $1 AND DATE(scanned_at) = CURRENT_DATE
    `;
    const result = await db.pool.query(query, [courseId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Get Today Logs By Course Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📊 Get Today's Attendance Master by Course ID
 */
exports.getTodayMasterByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const query = `
      SELECT am.* 
      FROM Attendance_Master am
      JOIN Class_Schedules cs ON am.session_id = cs.schedule_id
      WHERE cs.course_id = $1 AND cs.day_of_week = $2
      LIMIT 1
    `;
    const result = await db.pool.query(query, [courseId, dayOfWeek]);
    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error('❌ Get Today Master By Course Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
