// bot-ali-ultimate.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// Usar stealth plugin para evitar detection
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT ULTIMATE - Versão Extensão Simulada');

async function botUltimate() {
  // Configuração ULTRA REALISTA
  const userAgent = new UserAgent({ deviceCategory: 'mobile' });
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true
    },
    args: [
      '--window-size=390,844',
      '--window-position=100,100',
      '--disable-blink-features=AutomationControlled', // 🔥 REMOVE AUTOMATION FLAG
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--user-agent=' + userAgent.toString()
    ]
  });

  const page = await browser.newPage();
  
  try {
    // 🔥 CONFIGURAÇÃO STEALTH AVANÇADA
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Remove Chrome runtime
      Object.defineProperty(navigator, 'chrome', {
        get: () => undefined,
      });
      
      // Override permissions
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
      deviceScaleFactor: 3, // 🔥 Densidade de pixel mobile
      isMobile: true,
      hasTouch: true
    });

    // Simular ambiente mobile completo
    await page.emulate({
      viewport: {
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      },
      userAgent: userAgent.toString()
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
    
    // Estratégia mais robusta para encontrar inputs
    const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    if (emailInput) {
      await emailInput.type('marciocleydev@gmail.com', { delay: 100 });
      console.log('✅ Email digitado!');
      
      await delay(2000);
      await page.keyboard.press('Tab');
      console.log('✅ Pressionou TAB');
    }

    await delay(2000);

    console.log('3. 🖱️ Clicando no botão Continue...');
    
    // Estratégia melhorada para botões
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
      await senhaInput.type('Aliexpress@81050050', { delay: 80 });
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

    console.log('⏳ Aguardando login completar... 12 segundos');
    await delay(12000);

    console.log('6. 🪙 Indo para página de moedas MOBILE ULTRA...');
    
    // URL com parâmetros otimizados
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

        // Procurar em todos os seletores possíveis
        seletores.forEach(seletor => {
          const elementos = document.querySelectorAll(seletor);
          elementos.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
              const texto = el.textContent?.trim() || '';
              const html = el.innerHTML?.toLowerCase() || '';
              
              // Critérios mais amplos para moedas
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

        // Clicar em todos encontrados
        const clicados = [];
        botoesMoedas.forEach(item => {
          try {
            item.elemento.click();
            clicados.push(item.texto);
            console.log(`🎯 Clicou em: ${item.texto}`);
          } catch (e) {
            console.log(`❌ Erro ao clicar em: ${item.texto}`);
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

      // Recarregar se necessário
      if (tentativas === 2) {
        console.log('🔄 Recarregando página para forçar atualização...');
        await page.reload({ waitUntil: 'networkidle2' });
        await delay(5000);
      }
    }

    console.log(`\n🎉🎉🎉 RESULTADO FINAL: ${totalMoedas} MOEDAS RESGATADAS! 🎉🎉🎉`);

    // Espera final para ver o resultado
    await delay(8000);

    console.log('\n💡 Dica: Se ainda não apareceram todas as moedas, tente:');
    console.log('1. Fechar e executar o bot novamente');
    console.log('2. Verificar se há mais botões manualmente');
    console.log('3. O AliExpress pode limitar por horário/intervalo');

    console.log('\n🔒 Navegador permanecerá aberto...');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('💥 Erro crítico:', error);
  }
}

// Instalar dependências necessárias:
console.log('📦 Para instalar as dependências necessárias:');
console.log('npm install puppeteer-extra puppeteer-extra-plugin-stealth user-agents');
console.log('\n🚀 Executar: node bot-ali-ultimate.js');

botUltimate();