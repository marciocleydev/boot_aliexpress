// scripts/script-basico.js
const puppeteer = require('puppeteer');

async function automacaoBasica() {
  console.log('🚀 Iniciando automação AliExpress...');
  
  const browser = await puppeteer.launch({
    headless: "new",  // Modo novo do Chrome
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
    
    await page.screenshot({ path: 'passo1-inicio.png' });
    
    // 2. Tentar URLs ALTERNATIVAS para moedas
    console.log('2. 🪙 Tentando diferentes URLs de moedas...');
    
    const urlsMoedas = [
      'https://activities.aliexpress.com/coin/task.php',
      'https://www.aliexpress.com/activities/coin/index.html',
      'https://portuguese.aliexpress.com/coin/task',
      'https://app.aliexpress.com/coin/task'
    ];
    
    let urlFuncionou = false;
    
    for (const url of urlsMoedas) {
      try {
        console.log(`   🔗 Tentando: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        
        const titulo = await page.title();
        console.log(`   📄 Título: ${titulo}`);
        
        // Se não é página de erro, assumimos que funcionou
        if (!titulo.includes('404') && !titulo.includes('Error') && !titulo.includes('Not Found')) {
          console.log(`   ✅ URL funcionou: ${url}`);
          urlFuncionou = true;
          await page.screenshot({ path: 'passo2-moedas-encontrada.png' });
          break;
        }
      } catch (error) {
        console.log(`   ❌ URL falhou: ${url}`);
      }
    }
    
    if (!urlFuncionou) {
      console.log('❌ Nenhuma URL de moedas funcionou');
      
      // Tentar buscar link de moedas na página principal
      console.log('3. 🔍 Procurando link de moedas na página principal...');
      await page.goto('https://www.aliexpress.com', { waitUntil: 'networkidle2' });
      
      const linkMoedas = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (let link of links) {
          const href = link.href;
          const texto = link.textContent?.toLowerCase();
          if (href && (href.includes('coin') || href.includes('points') || 
                       texto?.includes('coin') || texto?.includes('point'))) {
            return href;
          }
        }
        return null;
      });
      
      if (linkMoedas) {
        console.log(`🔗 Link de moedas encontrado: ${linkMoedas}`);
        await page.goto(linkMoedas, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'passo3-moedas-link.png' });
        urlFuncionou = true;
      }
    }
    
    if (urlFuncionou) {
      // 3. Procurar botões de forma MAIS AGRESSIVA
      console.log('4. 🔄 Procurando botões PARA RESGATAR...');
      await page.waitForTimeout(5000);
      
      const botoesClicados = await page.evaluate(() => {
        const resultados = [];
        
        // Buscar TODOS os elementos clicáveis
        const elementos = document.querySelectorAll('button, .btn, [class*="button"], [role="button"], a');
        
        elementos.forEach(elemento => {
          if (elemento.offsetWidth > 0 && elemento.offsetHeight > 0 && !elemento.disabled) {
            const texto = elemento.textContent?.trim().toLowerCase();
            
            // Critérios MAIS AMPLOS para botões de moedas
            if (texto && (
              texto.includes('claim') || 
              texto.includes('resgatar') ||
              texto.includes('receber') ||
              texto.includes('get') ||
              texto.includes('collect') ||
              texto.includes('coin') ||
              texto.includes('point') ||
              /^\d+$/.test(texto) || // Apenas números
              texto.includes('daily') ||
              texto.includes('check-in') ||
              (texto.length <= 4 && !isNaN(parseInt(texto))) // Números curtos
            )) {
              resultados.push({
                texto: elemento.textContent?.trim(),
                tag: elemento.tagName
              });
              
              try {
                elemento.click();
              } catch (e) {
                // Tentar método alternativo
                elemento.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              }
            }
          }
        });
        
        return resultados;
      });
      
      console.log(`🎯 ${botoesClicados.length} botões clicados:`, botoesClicados);
      
      // Aguardar processamento
      await page.waitForTimeout(5000);
    }
    
    // Screenshot final
    await page.screenshot({ path: 'passo4-final.png' });
    
    console.log('🎉 Automação concluída!');
    
  } catch (error) {
    console.error('💥 Erro durante a automação:', error);
    await page.screenshot({ path: 'erro.png' });
  } finally {
    await browser.close();
  }
}

// Executar a automação
automacaoBasica().catch(console.error);
