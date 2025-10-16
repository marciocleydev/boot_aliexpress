// scripts/automate-coins.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Função de delay compatível
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function resgatarMoedas() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  
  try {
    // Configurar headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    });

    console.log('🌐 Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: '1-pagina-inicial.png' });

    // **Fazer login**
    console.log('🔐 Clicando no login...');
    
    // Tentar diferentes seletores de login
    const loginSelectors = [
      '[data-role="sign-link"]',
      '.sign-in',
      'a[href*="login"]',
      '.login-link',
      'span:has-text("Sign in")',
      'a:has-text("Sign in")'
    ];

    let loginClicked = false;
    for (const selector of loginSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        console.log(`✅ Login clicado: ${selector}`);
        loginClicked = true;
        await delay(5000);
        break;
      } catch (e) {
        // Continuar para próximo seletor
      }
    }

    if (!loginClicked) {
      console.log('🚀 Indo para página de login direto...');
      await page.goto('https://login.aliexpress.com/', {
        waitUntil: 'networkidle2'
      });
    }

    // Preencher formulário de login
    console.log('⌛ Aguardando formulário...');
    
    try {
      await page.waitForSelector('#fm-login-id', { timeout: 10000 });
      
      console.log('📝 Preenchendo credenciais...');
      await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL, { delay: 100 });
      await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
      
      console.log('🖱️ Submetendo login...');
      await page.click('button[type="submit"]');
      
      await delay(8000);
      await page.screenshot({ path: '2-pos-login.png' });
      
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      await page.screenshot({ path: 'erro-login.png' });
    }

    // **Acessar página de moedas**
    console.log('🪙 Acessando página de moedas...');
    
    try {
      await page.goto('https://www.aliexpress.com/coin/task', {
        waitUntil: 'networkidle2',
        timeout: 20000
      });
      
      console.log('📄 Título moedas:', await page.title());
      await delay(5000);
      await page.screenshot({ path: '3-pagina-moedas.png' });
      
    } catch (coinError) {
      console.log('❌ Erro ao acessar moedas:', coinError.message);
      
      // Tentar URL alternativa
      console.log('🔄 Tentando URL alternativa...');
      await page.goto('https://activities.aliexpress.com/coin/task.php', {
        waitUntil: 'networkidle2'
      });
      await delay(5000);
      await page.screenshot({ path: '4-moedas-alternativa.png' });
    }

    // **Resgatar moedas**
    console.log('🔍 Procurando botões...');
    
    const coinSelectors = [
      '.coin-task-claim',
      '.task-claim-btn',
      'button[class*="claim"]',
      'button[class*="task"]',
      '.next-btn-primary',
      '.btn-claim',
      '[data-role="claim"]',
      'button'
    ];

    let moedasResgatadas = 0;
    
    for (const selector of coinSelectors) {
      const buttons = await page.$$(selector);
      console.log(`🔍 ${buttons.length} botões com: ${selector}`);
      
      for (let i = 0; i < buttons.length; i++) {
        try {
          const button = buttons[i];
          const isVisible = await button.evaluate(el => {
            const style = window.getComputedStyle(el);
            return el.offsetWidth > 0 && 
                   el.offsetHeight > 0 && 
                   !el.disabled &&
                   style.visibility !== 'hidden' &&
                   style.display !== 'none';
          });
          
          if (isVisible) {
            const text = await button.evaluate(el => el.textContent?.trim() || '');
            if (text && (text.includes('Claim') || text.includes('Resgatar') || 
                         text.includes('Receber') || text.includes('Coins') ||
                         text.includes('Get') || text.match(/\d+/))) {
              
              console.log(`🖱️ Clicando: "${text.substring(0, 30)}"`);
              await button.click();
              moedasResgatadas++;
              await delay(3000);
            }
          }
        } catch (error) {
          console.log(`❌ Erro no botão ${i}:`, error.message);
        }
      }
    }

    console.log(`🎉 Finalizado! ${moedasResgatadas} ações realizadas.`);
    await page.screenshot({ path: '5-resultado-final.png' });

  } catch (error) {
    console.error('💥 Erro geral:', error);
    await page.screenshot({ path: 'erro-geral.png' });
  } finally {
    await browser.close();
  }
}

resgatarMoedas().catch(console.error);
