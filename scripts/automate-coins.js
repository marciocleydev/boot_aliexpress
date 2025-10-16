// scripts/automate-coins.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function resgatarMoedas() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  
  try {
    // Configurar viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navegar para AliExpress
    console.log('Navegando para AliExpress...');
    await page.goto('https://portuguese.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // **CORREÇÃO 1: Localizar o botão de login corretamente**
    console.log('Procurando botão de login...');
    
    // Tentar diferentes seletores de login
    const loginSelectors = [
      'a[href*="login"]',
      '.login-link',
      '.sign-in',
      'button[data-role="sign-link"]',
      '.fm-button',
      '.ui-button',
      'a[data-spm="daccount"]'
    ];

    let loginFound = false;
    for (const selector of loginSelectors) {
      const loginElement = await page.$(selector);
      if (loginElement) {
        console.log(`✅ Botão de login encontrado: ${selector}`);
        await loginElement.click();
        loginFound = true;
        await page.waitForTimeout(3000);
        break;
      }
    }

    if (!loginFound) {
      console.log('❌ Botão de login não encontrado. Tentando continuar...');
      // Tirar screenshot para debug
      await page.screenshot({ path: 'debug-login.png' });
    }

    // **CORREÇÃO 2: Login mais robusto**
    console.log('Aguardando formulário de login...');
    
    try {
      // Aguardar formulário de login aparecer
      await page.waitForSelector('#fm-login-id', { timeout: 10000 });
      
      console.log('Preenchendo credenciais...');
      await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL, { delay: 100 });
      await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
      
      // Clicar no botão de submit
      await page.click('button[type="submit"]');
      
      console.log('Aguardando login completar...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      
    } catch (loginError) {
      console.log('Formulário de login não apareceu. Verificando se já está logado...');
      await page.screenshot({ path: 'login-debug.png' });
    }

    // Navegar para página de moedas
    console.log('Indo para página de moedas...');
    await page.goto('https://portuguese.aliexpress.com/coin/task', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Aguardar carregamento
    await page.waitForTimeout(5000);
    
    // Screenshot para ver estado atual
    await page.screenshot({ path: 'pagina-moedas.png' });

    // **Lógica de resgate de moedas melhorada**
    console.log('Procurando botões de resgate...');
    
    const coinSelectors = [
      '.coin-task-claim',
      '.task-claim-btn', 
      'button[class*="claim"]',
      'button[class*="task"]',
      '.next-btn-primary',
      'button[class*="btn"]',
      '.btn-claim',
      '[data-role="claim"]'
    ];

    let moedasResgatadas = 0;

    for (const selector of coinSelectors) {
      try {
        const buttons = await page.$$(selector);
        console.log(`🔍 Encontrados ${buttons.length} botões com seletor: ${selector}`);
        
        for (let i = 0; i < buttons.length; i++) {
          try {
            // Verificar se botão está visível e habilitado
            const isClickable = await buttons[i].evaluate(btn => {
              return btn.offsetWidth > 0 && 
                     btn.offsetHeight > 0 && 
                     !btn.disabled &&
                     window.getComputedStyle(btn).pointerEvents !== 'none';
            });
            
            if (isClickable) {
              console.log(`🖱️ Clicando no botão ${i + 1}...`);
              await buttons[i].click();
              moedasResgatadas++;
              await page.waitForTimeout(3000); // Delay maior entre cliques
            }
          } catch (clickError) {
            console.log(`❌ Erro ao clicar no botão ${i + 1}:`, clickError.message);
          }
        }
      } catch (error) {
        console.log(`Seletor ${selector} não encontrado`);
      }
    }

    console.log(`🎉 Resgate concluído! ${moedasResgatadas} ações realizadas.`);
    
    // Screenshot final
    await page.screenshot({ path: 'resultado-final.png' });

  } catch (error) {
    console.error('❌ Erro durante a automação:', error);
    // Screenshot em caso de erro
    await page.screenshot({ path: 'erro-automacao.png' });
  } finally {
    await browser.close();
  }
}

// Executar
resgatarMoedas().catch(console.error);
