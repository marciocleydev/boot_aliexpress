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
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  
  try {
    // Configurar headers para parecer mais humano
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    // **CORREÇÃO: Usar URL internacional em vez da portuguesa**
    console.log('🌐 Acessando AliExpress internacional...');
    await page.goto('https://www.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Verificar se não é página de erro
    const title = await page.title();
    console.log('📄 Título da página:', title);

    if (title.includes('404') || title.includes('Error')) {
      throw new Error('Página de erro detectada');
    }

    await page.screenshot({ path: 'pagina-inicial.png' });

    // **Tentar login diretamente na página internacional**
    console.log('🔐 Tentando fazer login...');
    
    // Procurar botão de login na página internacional
    const loginSelectors = [
      'a[href*="member/union/login"]',
      '[data-role="sign-link"]',
      '.sign-in',
      '.login',
      'a[href*="login"]',
      'button[data-role="sign-link"]'
    ];

    let loginClicked = false;
    for (const selector of loginSelectors) {
      const loginBtn = await page.$(selector);
      if (loginBtn) {
        console.log(`✅ Clicando no login: ${selector}`);
        await loginBtn.click();
        loginClicked = true;
        await page.waitForTimeout(5000);
        break;
      }
    }

    if (!loginClicked) {
      console.log('🚀 Tentando acesso direto ao login...');
      await page.goto('https://login.aliexpress.com/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    }

    // Aguardar e preencher formulário de login
    console.log('⌛ Aguardando formulário de login...');
    
    try {
      await page.waitForSelector('#fm-login-id', { timeout: 10000 });
      
      console.log('📝 Preenchendo email...');
      await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL, { delay: 150 });
      
      console.log('📝 Preenchendo senha...');
      await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD, { delay: 150 });
      
      console.log('🖱️ Clicando no botão de login...');
      await page.click('button[type="submit"]');
      
      // Aguardar login (pode redirecionar ou não)
      await page.waitForTimeout(8000);
      
      // Verificar se login foi bem sucedido
      await page.screenshot({ path: 'pos-login.png' });
      
    } catch (loginError) {
      console.log('❌ Formulário de login não apareceu:', loginError.message);
      await page.screenshot({ path: 'erro-login.png' });
    }

    // **Tentar acessar página de moedas de diferentes formas**
    console.log('🪙 Tentando acessar página de moedas...');
    
    const coinUrls = [
      'https://www.aliexpress.com/coin/task',
      'https://activities.aliexpress.com/coin/task.php',
      'https://portuguese.aliexpress.com/coin/task'
    ];

    let coinsAccessed = false;
    
    for (const coinUrl of coinUrls) {
      try {
        console.log(`🔗 Tentando: ${coinUrl}`);
        await page.goto(coinUrl, {
          waitUntil: 'networkidle2',
          timeout: 20000
        });
        
        const currentTitle = await page.title();
        console.log(`📄 Título atual: ${currentTitle}`);
        
        if (!currentTitle.includes('404') && !currentTitle.includes('Error')) {
          console.log(`✅ Página acessada com sucesso: ${coinUrl}`);
          coinsAccessed = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Falha ao acessar ${coinUrl}: ${error.message}`);
      }
    }

    if (!coinsAccessed) {
      console.log('❌ Não foi possível acessar página de moedas');
      await page.screenshot({ path: 'erro-moedas.png' });
      return;
    }

    // Aguardar carregamento completo
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'pagina-moedas.png' });

    // **Buscar botões de resgate**
    console.log('🔍 Procurando botões de resgate...');
    
    const coinSelectors = [
      '.coin-task-claim',
      '.task-claim-btn',
      'button[class*="claim"]',
      'button[class*="task"]',
      '.next-btn-primary',
      '.btn-claim',
      '[data-role="claim"]',
      'button:not([disabled])'
    ];

    let moedasResgatadas = 0;
    
    for (const selector of coinSelectors) {
      try {
        const buttons = await page.$$(selector);
        console.log(`🔍 Encontrados ${buttons.length} botões com: ${selector}`);
        
        for (let i = 0; i < buttons.length; i++) {
          try {
            const buttonText = await buttons[i].evaluate(btn => btn.textContent?.trim() || '');
            
            // Verificar se é um botão de resgate
            if (buttonText.includes('Claim') || buttonText.includes('Resgatar') || 
                buttonText.includes('Receber') || buttonText.includes('Coins')) {
              
              console.log(`🖱️ Clicando no botão: "${buttonText}"`);
              await buttons[i].click();
              moedasResgatadas++;
              await page.waitForTimeout(4000);
            }
          } catch (clickError) {
            console.log(`❌ Erro ao clicar: ${clickError.message}`);
          }
        }
      } catch (error) {
        // Ignorar seletores não encontrados
      }
    }

    console.log(`🎉 Concluído! ${moedasResgatadas} moedas resgatadas.`);
    await page.screenshot({ path: 'resultado-final.png' });

  } catch (error) {
    console.error('💥 Erro geral:', error);
    await page.screenshot({ path: 'erro-geral.png' });
  } finally {
    await browser.close();
  }
}

resgatarMoedas().catch(console.error);
