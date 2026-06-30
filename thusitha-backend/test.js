const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning' || msg.text().toLowerCase().includes('error')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:5173/');
  await page.type('#username-input', 'admin');
  await page.type('#password-input', '123456');
  await page.click('button[type=\"submit\"]');
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
