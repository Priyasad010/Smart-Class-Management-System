const { Pool } = require('pg'); 
const pool = new Pool({user: 'postgres', host: 'localhost', database: 'thusithaedunew_db', password: '0909', port: 5432}); 
pool.query("SELECT DISTINCT role FROM users", (err, res) => { 
  console.log(res.rows.map(r=>r.role)); 
  pool.end(); 
});
