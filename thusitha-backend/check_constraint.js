const { Pool } = require('pg');
const pool = new Pool({user: 'postgres', database: 'thusithaedu_db', password: '1234'});

pool.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'study_area_bookings_booking_status_check'")
  .then(res => {
    console.log(res.rows);
  })
  .finally(() => pool.end());
