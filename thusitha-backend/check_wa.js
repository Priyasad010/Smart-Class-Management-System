const { Pool } = require('pg'); 
const pool = new Pool({user: 'postgres', host: 'localhost', database: 'thusithaedunew_db', password: '0909', port: 5432}); 
pool.query("SELECT * FROM users WHERE role='Admin' LIMIT 1", (err, res) => { 
  const jwt = require('jsonwebtoken'); 
  const token = jwt.sign({ id: res.rows[0].user_id, role: res.rows[0].role, username: res.rows[0].username }, 'supersecret_jwt_key_here_for_scms', { expiresIn: '1h' }); 
  const axios = require('axios'); 
  axios.get('http://localhost:5000/api/sms/whatsapp-status', {headers:{Authorization:'Bearer '+token}})
    .then(r => { console.log(r.data); pool.end(); })
    .catch(e => { console.log(e.message); pool.end(); }); 
});
