const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const http = require('http');

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'thusithaedu_db',
});

async function run() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Thusitha@123', salt);
    await pool.query("UPDATE Users SET password_hash = $1 WHERE username = 'ST10001'", [hash]);
    console.log('Password updated successfully for ST10001');

    const loginData = JSON.stringify({
      username: 'ST10001',
      password: 'Thusitha@123'
    });

    const reqLogin = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Login Status:', res.statusCode);
        const data = JSON.parse(body);
        if (data.token) {
          const reqResults = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/exams/results/15',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          }, (res2) => {
            let body2 = '';
            res2.on('data', chunk => body2 += chunk);
            res2.on('end', () => {
              console.log('Results Status:', res2.statusCode);
              console.log('Results Body:', body2);
            });
          });
          reqResults.end();
        } else {
          console.log('No token returned:', data);
        }
      });
    });

    reqLogin.write(loginData);
    reqLogin.end();
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
