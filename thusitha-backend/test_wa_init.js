const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './whatsapp-session-test' }),
  puppeteer: {
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

client.on('qr', (qr) => console.log('QR RECEIVED', qr));
client.on('ready', () => console.log('READY'));
client.on('auth_failure', (msg) => console.log('AUTH FAIL', msg));

client.initialize().catch(console.error);
