const puppeteer = require('puppeteer');

async function automacaoBasica() {
  console.log('🚀 Iniciando automação AliExpress...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // 1. Acessar AliExpress
    console.log('1. 📱 Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const titulo = await page.title();
    console.log('✅ Página carregada:', titulo);
    
    // Screenshot da página inicial
    await page.screenshot({ path: 'passo1-inicio.png' });
    
    // 2. Tentar acessar página de moedas
    console.log('2. 🪙 Tentando acessar página de moedas...');
    await page.goto('https://www.aliexpress.com/coin/task', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    const tituloMoedas = await page.title();
    console.log('📄 Título da página de moedas:', tituloMoedas);
    
    await page.screenshot({ path: 'passo2-moedas.png' });
    
    // 3. Verificar se está logado
    if (tituloMoedas.includes('Login') || tituloMoedas.includes('Sign')) {
      console.log('🔐 Precisa fazer login...');
    } else {
      console.log('✅ Possivelmente já está logado!');
      
      // 4. Tentar clicar em botões de "Claim"
      console.log('3. 🔄 Procurando botões para clicar...');
      
      const botoesClicados = await page.evaluate(() => {
        const resultados = [];
        const botoes = document.querySelectorAll('button');
        
        botoes.forEach(botao => {
          if (botao.offsetWidth > 0 && botao.offsetHeight > 0) {
            const texto = botao.textContent?.trim().toLowerCase();
            if (texto && (texto.includes('claim') || 
                         texto.includes('resgatar') ||
                         texto.includes('get') ||
                         /^\d+$/.test(texto))) {
              resultados.push(texto);
              try {
                botao.click();
              } catch (e) {
                // Ignorar erros de clique
              }
            }
          }
        });
        
        return resultados;
      });
      
      console.log(`🎯 ${botoesClicados.length} botões encontrados:`, botoesClicados);
      
      // Aguardar um pouco após os cliques
      await page.waitForTimeout(5000);
    }
    
    // Screenshot final
    await page.screenshot({ path: 'passo3-final.png' });
    
    console.log('🎉 Automação concluída! Verifique os screenshots.');
    
  } catch (error) {
    console.error('💥 Erro durante a automação:', error);
    await page.screenshot({ path: 'erro.png' });
  } finally {
    await browser.close();
  }
}

// Executar a automação
automacaoBasica().catch(console.error);
