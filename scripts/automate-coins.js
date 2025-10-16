// scripts/automate-coins.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Baseado na lógica do seu background.js
async function resgatarMoedas() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Configurar viewport como seu extension
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navegar para página de login
    console.log('Navegando para AliExpress...');
    await page.goto('https://portuguese.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // Fazer login (baseado na sua extensão)
    console.log('Fazendo login...');
    await page.click('a[href="#"]'); // Ajuste seletor conforme necessário
    
    await page.waitForSelector('#fm-login-id', { timeout: 10000 });
    await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL);
    await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Aguardar login completar
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Navegar para página de moedas (como sua extensão faz)
    console.log('Indo para página de moedas...');
    await page.goto('https://portuguese.aliexpress.com/coin/task', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Aguardar carregamento da página de moedas
    await page.waitForTimeout(5000);

    // Lógica de auto-click baseada na sua extensão
    console.log('Procurando botões para clicar...');
    
    // Seletores baseados na estrutura comum do AliExpress
    const selectors = [
      '.coin-task-claim',
      '.task-claim-btn',
      'button[class*="claim"]',
      'button[class*="task"]',
      '.next-btn-primary'
    ];

    let moedasResgatadas = 0;

    for (const selector of selectors) {
      const buttons = await page.$$(selector);
      console.log(`Encontrados ${buttons.length} botões com seletor: ${selector}`);
      
      for (const button of buttons) {
        try {
          const isVisible = await button.evaluate(el => {
            return el.offsetWidth > 0 && el.offsetHeight > 0;
          });
          
          if (isVisible) {
            await button.click();
            console.log('✅ Clique realizado');
            moedasResgatadas++;
            await page.waitForTimeout(2000); // Delay entre cliques
          }
        } catch (error) {
          console.log('❌ Erro ao clicar no botão:', error.message);
        }
      }
    }

    // Tirar screenshot como evidência
    await page.screenshot({ path: 'resultado-moedas.png' });
    console.log(`🎉 Resgate concluído! ${moedasResgatadas} ações realizadas.`);

  } catch (error) {
    console.error('❌ Erro durante a automação:', error);
    // Screenshot em caso de erro
    await page.screenshot({ path: 'erro-automacao.png' });
  } finally {
    await browser.close();
  }
}

// Executar função principal
resgatarMoedas().catch(console.error);
