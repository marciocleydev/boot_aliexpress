// scripts/login-corrigido.js
const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loginCorrigido() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    console.log('1. 🚀 Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: 'corrigido-1-inicio.png' });

    // **CORREÇÃO: Clicar no botão correto de login**
    console.log('2. 🔍 Procurando botão "Sign in"...');
    
    // Tentar seletores mais específicos
    const loginSelectors = [
      'span:has-text("Sign in")',
      'a:has-text("Sign in")',
      'button:has-text("Sign in")',
      '[data-role="sign-link"]',
      '.sign-in',
      '.login-link'
    ];

    let loginClicado = false;
    for (const selector of loginSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        console.log(`✅ Login clicado com: ${selector}`);
        loginClicado = true;
        await delay(5000);
        break;
      } catch (e) {
        console.log(`❌ Seletor ${selector} não encontrado`);
      }
    }

    if (!loginClicado) {
      console.log('🔄 Tentando busca por texto...');
      // Buscar por elemento com texto "Sign in"
      const signInElement = await page.evaluateHandle(() => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
          if (el.textContent?.includes('Sign in') && el.textContent.trim() === 'Sign in') {
            return el;
          }
        }
        return null;
      });
      
      if (signInElement) {
        await signInElement.click();
        console.log('✅ Login clicado por texto');
        loginClicado = true;
        await delay(5000);
      }
    }

    await page.screenshot({ path: 'corrigido-2-pos-click-login.png' });

    // **CORREÇÃO: Aguardar iframe de login aparecer**
    console.log('3. 🔄 Aguardando iframe de login...');
    await delay(3000);

    // Verificar se há iframes
    const frames = page.frames();
    console.log(`📋 ${frames.length} frames encontrados`);

    let loginFrame = null;
    for (const frame of frames) {
      try {
        const frameUrl = frame.url();
        console.log(`🔍 Frame: ${frameUrl}`);
        
        if (frameUrl.includes('login') || frameUrl.includes('auth') || frameUrl.includes('signin')) {
          console.log(`🎯 Frame de login encontrado: ${frameUrl}`);
          loginFrame = frame;
          break;
        }
      } catch (e) {
        // Ignorar frames inacessíveis
      }
    }

    // **CORREÇÃO: Preencher login no frame correto**
    const targetPage = loginFrame || page;
    
    console.log('4. 📝 Procurando campos no frame...');
    await targetPage.screenshot({ path: 'corrigido-3-frame-login.png' });

    // Listar TODOS os inputs disponíveis
    const allInputs = await targetPage.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        id: input.id,
        name: input.name,
        placeholder: input.placeholder,
        className: input.className,
        visible: input.offsetWidth > 0 && input.offsetHeight > 0
      }))
    );

    console.log('📋 Todos os inputs:', allInputs);

    // **CORREÇÃO: Tentar diferentes abordagens para preencher login**
    console.log('5. 🔧 Tentando preencher credenciais...');

    // Método 1: Tentar seletores conhecidos
    const emailFields = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="mail" i]',
      'input[autocomplete="email"]',
      '#fm-login-id',
      '.fm-text'
    ];

    const passwordFields = [
      'input[type="password"]',
      'input[name="password"]', 
      'input[placeholder*="password" i]',
      'input[placeholder*="senha" i]',
      'input[autocomplete="current-password"]',
      '#fm-login-password'
    ];

    let preenchido = false;

    for (const emailSelector of emailFields) {
      for (const passwordSelector of passwordFields) {
        try {
          await targetPage.waitForSelector(emailSelector, { timeout: 2000 });
          await targetPage.waitForSelector(passwordSelector, { timeout: 2000 });
          
          console.log(`✅ Campos encontrados: ${emailSelector}, ${passwordSelector}`);
          
          await targetPage.type(emailSelector, process.env.ALIEXPRESS_EMAIL, { delay: 100 });
          await targetPage.type(passwordSelector, process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
          
          preenchido = true;
          console.log('📝 Credenciais preenchidas!');
          break;
        } catch (e) {
          // Continuar para próxima combinação
        }
      }
      if (preenchido) break;
    }

    // Método 2: Se não encontrou, tentar pelo índice
    if (!preenchido) {
      console.log('🔄 Método 2: Tentando por índice...');
      const visibleInputs = allInputs.filter(input => input.visible);
      
      if (visibleInputs.length >= 2) {
        // Assumir que primeiro input é email, segundo é password
        const inputs = await targetPage.$$('input');
        const visibleInputElements = [];
        
        for (const input of inputs) {
          const isVisible = await input.evaluate(el => 
            el.offsetWidth > 0 && el.offsetHeight > 0
          );
          if (isVisible) visibleInputElements.push(input);
        }
        
        if (visibleInputElements.length >= 2) {
          await visibleInputElements[0].type(process.env.ALIEXPRESS_EMAIL, { delay: 100 });
          await visibleInputElements[1].type(process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
          preenchido = true;
          console.log('📝 Credenciais preenchidas por índice!');
        }
      }
    }

    if (preenchido) {
      await targetPage.screenshot({ path: 'corrigido-4-credenciais.png' });

      // Clicar no botão de submit
      console.log('6. 🖱️ Clicando em submit...');
      await targetPage.click('button[type="submit"]');
      
      console.log('⏳ Aguardando login...');
      await delay(10000);

      await page.screenshot({ path: 'corrigido-5-pos-login.png' });
      console.log('🎯 URL final:', page.url());
      console.log('📄 Título final:', await page.title());

      // Verificar se login foi bem sucedido
      if (!page.url().includes('login')) {
        console.log('✅ Login aparentemente bem sucedido!');
        
        // Tentar acessar moedas
        console.log('7. 🪙 Acessando página de moedas...');
        await page.goto('https://www.aliexpress.com/coin/task', {
          waitUntil: 'networkidle2',
          timeout: 15000
        });
        
        await delay(5000);
        await page.screenshot({ path: 'corrigido-6-moedas.png' });
        console.log('📄 Título moedas:', await page.title());
        
        // Verificar conteúdo da página
        const pageContent = await page.content();
        if (pageContent.includes('coin') || pageContent.includes('task')) {
          console.log('✅ Página de moedas carregada!');
        } else {
          console.log('❌ Página de moedas não carregou corretamente');
        }
      } else {
        console.log('❌ Login pode ter falhado');
      }
    } else {
      console.log('❌ Não foi possível preencher credenciais');
      await page.screenshot({ path: 'corrigido-erro-campos.png' });
    }

  } catch (error) {
    console.error('💥 Erro:', error);
    await page.screenshot({ path: 'corrigido-erro-geral.png' });
  } finally {
    await browser.close();
  }
}

loginCorrigido().catch(console.error);
