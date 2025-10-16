// scripts/diagnostico.js
const puppeteer = require('puppeteer');

async function diagnostico() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('🔍 Testando diferentes URLs...');
  
  const testUrls = [
    'https://www.aliexpress.com',
    'https://login.aliexpress.com',
    'https://activities.aliexpress.com'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\n📡 Testando: ${url}`);
      await page.goto(url, { timeout: 15000 });
      console.log(`✅ Status: OK - Título: ${await page.title()}`);
      await page.screenshot({ path: `test-${url.split('//')[1].split('/')[0]}.png` });
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
  
  await browser.close();
}

diagnostico();
