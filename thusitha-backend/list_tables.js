const { Pool } = require('pg');
const pool = new Pool({user: 'postgres', host: 'localhost', database: 'thusithaedu_db', password: '1234', port: 5432});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows.map(r => r.table_name).join('\n'));
  pool.end();
});
