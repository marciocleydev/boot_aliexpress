// scripts/teste-fluxo-simples.js
const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testeFluxoSimples() {
  console.log('🔧 Este é um teste do fluxo básico...');
  console.log('📝 O que vamos testar:');
  console.log('   1. Acesso via Google');
  console.log('   2. Captcha (vai falhar)');
  console.log('   3. Estrutura da página de login');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // Ir direto para AliExpress (pula Google)
    await page.goto('https://www.aliexpress.com');
    await delay(5000);
    
    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: 'teste-fluxo.png' });
    
    // Verificar estrutura da página
    const estrutura = await page.evaluate(() => {
      const elementos = [];
      
      // Botões importantes
      const botoes = document.querySelectorAll('button, a');
      botoes.forEach(el => {
        if (el.textContent?.trim()) {
          elementos.push({
            tipo: el.tagName,
            texto: el.textContent.trim(),
            classe: el.className
          });
        }
      });
      
      return elementos.slice(0, 10); // Primeiros 10 elementos
    });
    
    console.log('🔍 Elementos encontrados:');
    estrutura.forEach(el => {
      console.log(`   - ${el.tipo}: "${el.texto}"`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await browser.close();
  }
}

testeFluxoSimples();
