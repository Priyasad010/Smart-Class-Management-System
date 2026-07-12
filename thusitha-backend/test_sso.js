const { Pool } = require('pg'); 
const pool = new Pool({user: 'postgres', host: 'localhost', database: 'thusithaedunew_db', password: '0909', port: 5432}); 
pool.query("SELECT * FROM users WHERE role='Counter Person' LIMIT 1", (err, res) => { 
  if (res.rows.length === 0) { console.log('No such user'); return pool.end(); }
  console.log("Testing with user:", res.rows[0].username, "Role:", res.rows[0].role);
  const jwt = require('jsonwebtoken'); 
  const token = jwt.sign({ id: res.rows[0].user_id, role: res.rows[0].role, username: res.rows[0].username }, 'supersecret_jwt_key_here_for_scms', { expiresIn: '1h' }); 
  const axios = require('axios'); 
  axios.get('http://localhost:5000/api/moodle-sso/url', {headers:{Authorization:'Bearer '+token}})
    .then(r => { console.log('Success:', r.data); pool.end(); })
    .catch(e => { console.log('Error:', e.response?.data || e.message); pool.end(); }); 
});
