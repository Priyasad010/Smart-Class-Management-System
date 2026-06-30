const http = require('http');

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
    console.log('Login Response Status:', res.statusCode);
    const data = JSON.parse(body);
    console.log('Login Response Data:', data);
    
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
          console.log('Results Response Status:', res2.statusCode);
          console.log('Results Response Body:', body2);
        });
      });
      reqResults.end();
    }
  });
});

reqLogin.write(loginData);
reqLogin.end();
