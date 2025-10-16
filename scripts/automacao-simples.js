// scripts/automacao-simples.js
const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function automacaoSimples() {
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

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    console.log('1. 🚀 Acessando AliExpress...');
    await page.goto('https://www.aliexpress.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('📄 Título:', await page.title());
    await page.screenshot({ path: 'simple-1-inicio.png' });

    // **Estratégia Simples: Clicar em elementos visíveis**
    console.log('2. 👤 Procurando elementos de login...');
    
    // Listar elementos clicáveis com textos relacionados a conta
    const elementosUteis = await page.evaluate(() => {
      const elementos = [];
      const tags = ['a', 'button', 'span', 'div'];
      
      tags.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach(el => {
          if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            const texto = el.textContent?.trim();
            if (texto && (texto.includes('Sign in') || 
                         texto.includes('Account') || 
                         texto.includes('Login') ||
                         texto === 'Sign in' ||
                         texto === 'Account')) {
              elementos.push({
                tag: tag,
                texto: texto,
                classe: el.className
              });
            }
          }
        });
      });
      
      return elementos;
    });

    console.log('🔍 Elementos encontrados:');
    elementosUteis.forEach(el => {
      console.log(`   - ${el.tag}: "${el.texto}"`);
    });

    // **Tentar clicar no elemento mais promissor**
    if (elementosUteis.length > 0) {
      console.log('3. 🖱️ Clicando no elemento de login...');
      
      // Tentar clicar no primeiro elemento
      await page.evaluate((texto) => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
          if (el.textContent?.trim() === texto) {
            el.click();
            return true;
          }
        }
        return false;
      }, elementosUteis[0].texto);
      
      await delay(5000);
      await page.screenshot({ path: 'simple-2-pos-clique.png' });
    }

    // **Preencher login se aparecer modal**
    console.log('4. 🔐 Verificando se há formulário de login...');
    
    const inputs = await page.$$('input');
    console.log(`📋 ${inputs.length} inputs encontrados`);
    
    let emailPreenchido = false;
    let senhaPreenchida = false;
    
    for (let input of inputs) {
      const inputType = await input.evaluate(el => el.type);
      const inputPlaceholder = await input.evaluate(el => el.placeholder);
      
      console.log(`🔍 Input: type=${inputType}, placeholder=${inputPlaceholder}`);
      
      if ((inputType === 'email' || inputType === 'text') && !emailPreenchido) {
        await input.type(process.env.ALIEXPRESS_EMAIL, { delay: 100 });
        emailPreenchido = true;
        console.log('✅ Email preenchido');
      }
      
      if (inputType === 'password' && !senhaPreenchida) {
        await input.type(process.env.ALIEXPRESS_PASSWORD, { delay: 100 });
        senhaPreenchida = true;
        console.log('✅ Senha preenchida');
      }
    }

    if (emailPreenchido && senhaPreenchida) {
      console.log('5. 🖱️ Submetendo formulário...');
      await page.screenshot({ path: 'simple-3-credenciais.png' });
      
      // Clicar em botão de submit
      await page.evaluate(() => {
        const botoes = document.querySelectorAll('button, input[type="submit"]');
        for (let btn of botoes) {
          if (btn.type === 'submit' || 
              btn.textContent?.toLowerCase().includes('sign in') ||
              btn.textContent?.toLowerCase().includes('login')) {
            btn.click();
            return;
          }
        }
        // Clicar no primeiro botão se não encontrou específico
        if (botoes.length > 0) botoes[0].click();
      });
      
      await delay(8000);
      await page.screenshot({ path: 'simple-4-pos-login.png' });
    }

    // **Ir para página de moedas**
    console.log('6. 🪙 Acessando página de moedas...');
    await page.goto('https://www.aliexpress.com/coin/task', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await delay(5000);
    await page.screenshot({ path: 'simple-5-moedas.png' });
    console.log('📄 Título:', await page.title());

    // **Resgatar moedas**
    console.log('7. 🔄 Resgatando moedas...');
    
    const botoesClicados = await page.evaluate(() => {
      const resultados = [];
      const botoes = document.querySelectorAll('button');
      
      botoes.forEach(botao => {
        if (botao.offsetWidth > 0 && botao.offsetHeight > 0 && !botao.disabled) {
          const texto = botao.textContent?.trim().toLowerCase();
          if (texto && (texto.includes('claim') || 
                       texto.includes('resgatar') ||
                       texto.includes('get') ||
                       /^\d+$/.test(texto))) {
            resultados.push(texto);
            try {
              botao.click();
            } catch (e) {
              // Ignorar erros
            }
          }
        }
      });
      
      return resultados;
    });

    console.log(`🎯 ${botoesClicados.length} botões clicados:`, botoesClicados);
    
    await delay(5000);
    await page.screenshot({ path: 'simple-6-resultado.png' });

    console.log(`🎉 CONCLUÍDO! ${botoesClicados.length} ações realizadas.`);

  } catch (error) {
    console.error('💥 Erro:', error);
    await page.screenshot({ path: 'simple-erro.png' });
  } finally {
    await browser.close();
  }
}

automacaoSimples().catch(console.error);
