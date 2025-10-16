// scripts/debug-detailed.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugDetalhado() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('1. 📱 Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: 'debug-1-inicial.png' });

    // **Debug: Ver todos os links da página**
    console.log('2. 🔍 Analisando estrutura da página...');
    const allLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim().substring(0, 50),
        href: link.href,
        className: link.className
      })).filter(link => link.text && link.text.length > 0)
    );

    console.log('📋 Links encontrados:');
    allLinks.slice(0, 15).forEach(link => {
      console.log(`   - "${link.text}" -> ${link.href} [${link.className}]`);
    });

    // **Procurar botão de login de forma mais inteligente**
    console.log('3. 🔐 Procurando botão de login...');
    
    const loginKeywords = ['sign in', 'login', 'entrar', 'conectar', 'account', 'member'];
    let loginElement = null;

    for (const keyword of loginKeywords) {
      const elements = await page.$$eval(`a, button, span, div`, (elements, kw) => {
        return elements.filter(el => {
          const text = el.textContent?.toLowerCase().trim();
          return text && text.includes(kw.toLowerCase());
        }).map(el => ({
          element: el.outerHTML.substring(0, 100),
          text: el.textContent?.trim(),
          tag: el.tagName
        }));
      }, keyword);

      if (elements.length > 0) {
        console.log(`✅ Encontrado com palavra-chave "${keyword}":`, elements[0]);
        loginElement = elements[0];
        break;
      }
    }

    if (loginElement) {
      console.log('4. 🖱️ Clicando no elemento de login...');
      // Clicar no primeiro elemento que contém texto de login
      await page.click(`:has-text("${loginElement.text}")`);
      await delay(5000);
      await page.screenshot({ path: 'debug-2-pos-click-login.png' });
    } else {
      console.log('❌ Nenhum elemento de login encontrado');
    }

    // **Verificar se apareceu popup/modal de login**
    console.log('5. 🔎 Verificando modais/popups...');
    
    const modalSelectors = [
      '.login-container',
      '.login-dialog',
      '.signin-modal',
      '.fm-login',
      '#alibaba-login-box',
      '.quick-login'
    ];

    let modalEncontrado = false;
    for (const selector of modalSelectors) {
      const modal = await page.$(selector);
      if (modal) {
        console.log(`✅ Modal encontrado: ${selector}`);
        modalEncontrado = true;
        break;
      }
    }

    if (!modalEncontrado) {
      console.log('🔍 Nenhum modal específico encontrado, verificando todos os iframes...');
      const frames = page.frames();
      console.log(`📋 ${frames.length} frames encontrados`);
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        try {
          const frameUrl = frame.url();
          if (frameUrl.includes('login') || frameUrl.includes('signin')) {
            console.log(`🎯 Frame de login encontrado: ${frameUrl}`);
            
            // Trocar para o frame de login
            page = frame;
            break;
          }
        } catch (e) {
          // Ignorar frames inacessíveis
        }
      }
    }

    // **Tentar encontrar campos de login de várias formas**
    console.log('6. 🔍 Buscando campos de login...');
    
    const emailSelectors = [
      '#fm-login-id',
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="mail" i]',
      'input[autocomplete="email"]'
    ];

    const passwordSelectors = [
      '#fm-login-password', 
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="senha" i]'
    ];

    let emailField = null;
    let passwordField = null;

    for (const selector of emailSelectors) {
      emailField = await page.$(selector);
      if (emailField) {
        console.log(`✅ Campo email encontrado: ${selector}`);
        break;
      }
    }

    for (const selector of passwordSelectors) {
      passwordField = await page.$(selector);
      if (passwordField) {
        console.log(`✅ Campo senha encontrado: ${selector}`);
        break;
      }
    }

    if (emailField && passwordField) {
      console.log('7. 📝 Preenchendo credenciais...');
      await emailField.type(process.env.ALIEXPRESS_EMAIL, { delay: 100 });
      await passwordField.type(process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
      
      await page.screenshot({ path: 'debug-3-credenciais-preenchidas.png' });

      // Clicar no botão de submit
      await page.click('button[type="submit"]');
      console.log('🔄 Aguardando login...');
      await delay(10000);
      
      await page.screenshot({ path: 'debug-4-pos-login.png' });
      console.log('📄 Título após login:', await page.title());
    } else {
      console.log('❌ Campos de login não encontrados');
      console.log('📍 Tentando URL de login direto...');
      await page.goto('https://login.aliexpress.com/', { waitUntil: 'networkidle2' });
      await delay(5000);
      await page.screenshot({ path: 'debug-5-login-direto.png' });
    }

  } catch (error) {
    console.error('💥 Erro:', error);
    await page.screenshot({ path: 'debug-erro.png' });
  } finally {
    await browser.close();
  }
}

debugDetalhado().catch(console.error);
