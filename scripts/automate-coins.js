// scripts/simple-test.js
const puppeteer = require('puppeteer');

async function testeSimples() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('📱 Acessando AliExpress...');
    await page.goto('https://portuguese.aliexpress.com');
    await page.screenshot({ path: 'pagina-inicial.png' });
    
    console.log('🔍 Verificando estrutura da página...');
    const pageContent = await page.content();
    console.log('Título da página:', await page.title());
    
    // Listar todos os links e botões
    const links = await page.$$eval('a, button', elements => 
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 50),
        href: el.href,
        class: el.className
      }))
    );
    
    console.log('📋 Elementos encontrados:', links.slice(0, 10));
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await browser.close();
  }
}

testeSimples();
