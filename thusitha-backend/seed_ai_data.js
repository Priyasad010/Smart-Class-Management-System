const db = require('./db');

(async () => {
  try {
    console.log('🌱 Starting AI Dummy Data Seeder...');

    const scheduleId = 1; // Pick session 1
    const qrCount = 35;
    const aiHeadcount = 42; // Mismatch!
    const mismatchDetected = true;
    
    // Fake zone breakdown for AI
    const zoneDetails = {
      "Zone 1 (Front)": 15,
      "Zone 2 (Middle)": 20,
      "Zone 3 (Back)": 7
    };
    
    const verificationData = {
      unverified_students: [
        { id: 10, name: "Nimal Perera" },
        { id: 11, name: "Kamal Silva" }
      ],
      zone_details: zoneDetails,
      image_paths: {
        "Zone 1 (Front)": "/uploads/suspicious/zone1_sample.jpg"
      }
    };

    console.log('📥 Inserting Attendance_Master record...');
    const masterQuery = `
      INSERT INTO Attendance_Master (session_id, qr_count, ai_headcount, zone_details, mismatch_detected, verification_data, validated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (session_id) 
      DO UPDATE SET qr_count = $2, ai_headcount = $3, zone_details = $4, mismatch_detected = $5, verification_data = $6, validated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    await db.pool.query(masterQuery, [
      scheduleId, qrCount, aiHeadcount, JSON.stringify(zoneDetails), mismatchDetected, JSON.stringify(verificationData)
    ]);

    console.log('📥 Inserting Suspicious_Attendance_Logs record...');
    const suspiciousQuery = `
      INSERT INTO Suspicious_Attendance_Logs (session_id, qr_count, ai_headcount, zone_details, unverified_student_ids, image_paths, status, detected_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', CURRENT_TIMESTAMP)
    `;
    const unverifiedIds = verificationData.unverified_students.map(s => s.id);
    await db.pool.query(suspiciousQuery, [
      scheduleId, qrCount, aiHeadcount, JSON.stringify(zoneDetails), JSON.stringify(unverifiedIds), JSON.stringify(verificationData.image_paths)
    ]);

    console.log('✅ AI dummy data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
})();
