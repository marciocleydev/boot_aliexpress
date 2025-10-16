// scripts/teste-login.js
const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testeLogin() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('1. Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com');
    await page.screenshot({ path: 'teste-1-inicio.png' });

    console.log('2. Clicando login...');
    await page.click('[data-role="sign-link"]');
    await delay(5000);
    await page.screenshot({ path: 'teste-2-pre-login.png' });

    console.log('3. Preenchendo formulário...');
    await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL);
    await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD);
    await page.click('button[type="submit"]');
    
    await delay(10000);
    await page.screenshot({ path: 'teste-3-pos-login.png' });

    console.log('4. Verificando se login funcionou...');
    const currentUrl = page.url();
    console.log('URL atual:', currentUrl);
    
    if (currentUrl.includes('aliexpress.com') && !currentUrl.includes('login')) {
      console.log('✅ Login provavelmente bem sucedido!');
    } else {
      console.log('❌ Login pode ter falhado');
    }

  } catch (error) {
    console.error('Erro:', error);
    await page.screenshot({ path: 'teste-erro.png' });
  } finally {
    await browser.close();
  }
}

testeLogin();
