// bot-ali-gh-actions.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// Usar stealth plugin para evitar detection
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT ULTIMATE - GitHub Actions Version');

async function botUltimate() {
  // Obter credenciais das variáveis de ambiente
  const email = process.env.ALIEXPRESS_EMAIL;
  const password = process.env.ALIEXPRESS_PASSWORD;
  
  if (!email || !password) {
    console.error('❌ Credenciais não encontradas nas variáveis de ambiente');
    process.exit(1);
  }

  console.log('📧 Email:', email);
  console.log('🔑 Senha:', '***' + password.slice(-4)); // Log parcial por segurança

  // Configuração para GitHub Actions (headless)
  const userAgent = new UserAgent({ deviceCategory: 'mobile' });
  
  const browser = await puppeteer.launch({
    headless: true, // Modo headless para GitHub Actions
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=390,844',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--user-agent=' + userAgent.toString()
    ]
  });

  const page = await browser.newPage();
  
  try {
    // 🔥 CONFIGURAÇÃO STEALTH AVANÇADA (mesmo do original)
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      Object.defineProperty(navigator, 'chrome', {
        get: () => undefined,
      });
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    // Configurar como mobile REAL
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    console.log('📱 Ambiente mobile STEALTH configurado!');

    console.log('1. 🔐 Indo para página de login...');
    await page.goto('https://login.aliexpress.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Página de login carregada!');
    await delay(4000);

    console.log('2. 📝 Preenchendo email...');
    
    const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    if (emailInput) {
      await emailInput.type(email, { delay: 100 });
      console.log('✅ Email digitado!');
      
      await delay(2000);
      await page.keyboard.press('Tab');
      console.log('✅ Pressionou TAB');
    }

    await delay(2000);

    console.log('3. 🖱️ Clicando no botão Continue...');
    
    const continueBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('continue') || texto.includes('continuar');
      });
    });

    if (continueBtn.asElement()) {
      await continueBtn.asElement().click();
      console.log('✅ Botão Continue clicado!');
    } else {
      console.log('❌ Botão Continue não encontrado, tentando alternativa...');
      await page.keyboard.press('Enter');
    }

    console.log('⏳ Aguardando campo de senha...');
    await delay(5000);

    console.log('4. 🔐 Preenchendo senha...');
    
    const senhaInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    if (senhaInput) {
      await senhaInput.type(password, { delay: 80 });
      console.log('✅ Senha preenchida!');
    }

    await delay(2000);

    console.log('5. 🖱️ Finalizando login...');
    
    const signInBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('sign in') || texto.includes('login') || texto.includes('entrar') || 
               texto.includes('acessar') || texto.includes('confirmar');
      });
    });

    if (signInBtn.asElement()) {
      await signInBtn.asElement().click();
      console.log('✅ Botão Sign In clicado!');
    } else {
      console.log('💡 Pressionando Enter para login...');
      await page.keyboard.press('Enter');
    }

    console.log('⏳ Aguardando login completar... 15 segundos');
    await delay(15000);

    // Verificar se login foi bem sucedido
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('❌ Login falhou! Verifique as credenciais.');
      await browser.close();
      return;
    }

    console.log('✅ Login realizado com sucesso!');

    console.log('6. 🪙 Indo para página de moedas MOBILE ULTRA...');
    
    await page.goto('https://m.aliexpress.com/p/coin-index/index.html?utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL&_mobile=1&_is_mobile=1', {
      waitUntil: 'networkidle2',
      timeout: 20000
    });

    console.log('✅ Página de moedas carregada!');
    await delay(6000);

    console.log('7. 🔄 BUSCA AVANÇADA por moedas...');
    
    let totalMoedas = 0;
    let tentativas = 0;
    const maxTentativas = 5;

    while (tentativas < maxTentativas) {
      tentativas++;
      console.log(`\n🔄 Tentativa ${tentativas}/${maxTentativas}`);
      
      const resultado = await page.evaluate(() => {
        const botoesMoedas = [];
        const seletores = [
          'button',
          '.btn-claim',
          '.claim-btn',
          '[class*="claim"]',
          '[class*="coin"]',
          '[class*="button"]'
        ];

        seletores.forEach(seletor => {
          const elementos = document.querySelectorAll(seletor);
          elementos.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
              const texto = el.textContent?.trim() || '';
              const html = el.innerHTML?.toLowerCase() || '';
              
              if (/^\d+$/.test(texto) || 
                  texto.toLowerCase().includes('claim') ||
                  texto.toLowerCase().includes('ganhe') ||
                  texto.toLowerCase().includes('coletar') ||
                  texto.toLowerCase().includes('receber') ||
                  texto.includes('+') ||
                  html.includes('coin') ||
                  html.includes('moeda')) {
                
                if (!botoesMoedas.some(b => b.texto === texto)) {
                  botoesMoedas.push({
                    elemento: el,
                    texto: texto,
                    seletor: seletor
                  });
                }
              }
            }
          });
        });

        const clicados = [];
        botoesMoedas.forEach(item => {
          try {
            item.elemento.click();
            clicados.push(item.texto);
          } catch (e) {
            // Ignora erros de clique
          }
        });

        return {
          encontrados: botoesMoedas.map(b => b.texto),
          clicados: clicados,
          totalEncontrados: botoesMoedas.length,
          totalClicados: clicados.length
        };
      });

      console.log(`📊 Encontrados: ${resultado.totalEncontrados}`);
      console.log(`🎯 Clicados: ${resultado.totalClicados}`);
      console.log(`📝 Botões:`, resultado.encontrados);

      totalMoedas += resultado.totalClicados;

      if (resultado.totalClicados > 0) {
        console.log('⏳ Aguardando processamento...');
        await delay(4000);
      }

      // Scroll estratégico
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * 0.3);
      });
      await delay(2000);
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * 0.7);
      });
      await delay(2000);

      if (tentativas === 2) {
        console.log('🔄 Recarregando página para forçar atualização...');
        await page.reload({ waitUntil: 'networkidle2' });
        await delay(5000);
      }
    }

    console.log(`\n🎉🎉🎉 RESULTADO FINAL: ${totalMoedas} MOEDAS RESGATADAS! 🎉🎉🎉`);

    // Salvar screenshot para debug
    await page.screenshot({ path: '/tmp/resultado-moedas.png', fullPage: true });
    console.log('📸 Screenshot salvo em /tmp/resultado-moedas.png');

  } catch (error) {
    console.error('💥 Erro crítico:', error);
    // Salvar screenshot em caso de erro
    await page.screenshot({ path: '/tmp/erro-moedas.png', fullPage: true });
    console.log('📸 Screenshot do erro salvo em /tmp/erro-moedas.png');
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Navegador fechado.');
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  botUltimate().catch(error => {
    console.error('❌ Erro na execução do bot:', error);
    process.exit(1);
  });
}

module.exports = botUltimate;
