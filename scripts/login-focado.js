// scripts/login-focado.js
const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loginFocado() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // Ir direto para página de login
    console.log('🚀 Indo direto para página de login...');
    await page.goto('https://login.aliexpress.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: 'login-1-pagina.png' });

    // Verificar se estamos na página de login correta
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);

    // Preencher login
    console.log('🔍 Procurando campos...');
    
    // Listar todos os inputs para debug
    const allInputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        id: input.id,
        name: input.name,
        placeholder: input.placeholder,
        className: input.className
      }))
    );

    console.log('📋 Inputs encontrados:', allInputs);

    // Tentar preencher email
    console.log('📝 Preenchendo email...');
    await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL, { delay: 100 });
    
    console.log('📝 Preenchendo senha...');
    await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD, { delay: 100 });

    await page.screenshot({ path: 'login-2-campos-preenchidos.png' });

    console.log('🖱️ Clicando em submit...');
    await page.click('button[type="submit"]');

    console.log('⏳ Aguardando redirecionamento...');
    await delay(15000);

    await page.screenshot({ path: 'login-3-resultado.png' });
    console.log('🎯 URL final:', page.url());
    console.log('📄 Título final:', await page.title());

    // Verificar se login foi bem sucedido
    if (page.url().includes('aliexpress.com') && !page.url().includes('login')) {
      console.log('✅ Login aparentemente bem sucedido!');
      
      // Tentar acessar página de moedas
      console.log('🪙 Tentando acessar moedas...');
      await page.goto('https://www.aliexpress.com/coin/task');
      await delay(5000);
      await page.screenshot({ path: 'login-4-moedas.png' });
      console.log('📄 Título moedas:', await page.title());
    } else {
      console.log('❌ Login pode ter falhado');
    }

  } catch (error) {
    console.error('💥 Erro:', error);
    await page.screenshot({ path: 'login-erro.png' });
  } finally {
    await browser.close();
  }
}

loginFocado().catch(console.error);
