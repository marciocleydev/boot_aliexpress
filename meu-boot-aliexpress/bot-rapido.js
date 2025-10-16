// bot-rapido-mobile-final.js
const puppeteer = require('puppeteer-core');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT MOBILE FINAL - Janela mantém tamanho');

async function botRapido() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: null,
    args: ['--window-size=390,844', '--window-position=0,0'] // 🔥 Tamanho FIXO
  });

  const page = await browser.newPage();
  
  try {
    // 🔥 CONFIGURAR COMO MOBILE ANTES DE TUDO
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    
    console.log('1. 🔐 Indo para página de login...');
    await page.goto('https://login.aliexpress.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Página de login carregada!');
    await delay(3000);

    console.log('2. 📝 Preenchendo email...');
    
    // Preencher email
    const inputsIniciais = await page.$$('input');
    let emailPreenchido = false;
    
    for (let input of inputsIniciais) {
      const type = await input.evaluate(el => el.type);
      
      if ((type === 'email' || type === 'text') && !emailPreenchido) {
        await input.type('marciocleydev@gmail.com', { delay: 150 });
        emailPreenchido = true;
        console.log('✅ Email digitado...');
        
        await delay(2000);
        await page.keyboard.press('Tab');
        console.log('✅ Pressionou TAB para sair do campo');
        break;
      }
    }

    await delay(1000);

    console.log('3. 🖱️ Clicando no botão Continue...');
    
    const continueClicado = await page.evaluate(() => {
      const botoes = document.querySelectorAll('button');
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
        if (texto.includes('continue') || texto.includes('continuar')) {
          console.log('✅ Botão Continue encontrado, clicando...');
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (continueClicado) {
      console.log('✅ Botão Continue clicado!');
    } else {
      console.log('❌ Botão Continue não encontrado');
    }

    console.log('⏳ Aguardando campo de senha aparecer... 5 segundos');
    await delay(5000);

    console.log('4. 🔐 BUSCANDO INPUTS NOVAMENTE para senha...');
    
    const inputsAtualizados = await page.$$('input');
    let senhaPreenchida = false;
    
    for (let input of inputsAtualizados) {
      const type = await input.evaluate(el => el.type);
      
      if (type === 'password' && !senhaPreenchida) {
        await input.type('Aliexpress@81050050', { delay: 100 });
        senhaPreenchida = true;
        console.log('✅ Senha preenchida com sucesso!');
        break;
      }
    }

    if (!senhaPreenchida) {
      console.log('❌ Campo de senha não encontrado após busca renovada');
      await page.type('input[type="password"]', 'Aliexpress@81050050', { delay: 100 });
      console.log('✅ Senha preenchida via seletor CSS');
    }

    await delay(1000);

    console.log('5. 🖱️ Clicando no botão Sign In...');
    
    const signInClicado = await page.evaluate(() => {
      const botoes = document.querySelectorAll('button');
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
        if (texto.includes('sign in') || texto.includes('login') || texto.includes('entrar')) {
          console.log('✅ Botão Sign In encontrado, clicando...');
          btn.click();
          return true;
        }
      }
      
      for (let btn of botoes) {
        if (btn.offsetWidth > 0 && btn.offsetHeight > 0) {
          console.log('✅ Primeiro botão visível clicado');
          btn.click();
          return true;
        }
      }
      
      return false;
    });

    if (!signInClicado) {
      console.log('💡 CLIQUE MANUALMENTE NO BOTÃO DE LOGIN');
    }

    console.log('⏳ Aguardando login completar... 10 segundos');
    await delay(10000);

    // 🔥 REMOVIDO: page.setViewport() - Mantém tamanho original da janela
    
    console.log('6. 🪙 Indo para página de moedas MOBILE...');
    await page.goto('https://m.aliexpress.com/p/coin-index/index.html?utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    console.log('✅ Página de moedas MOBILE carregada!');
    await delay(5000);

    console.log('7. 🔄 Procurando moedas para resgatar...');
    
    let totalMoedas = 0;
    
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      console.log(`🔄 Tentativa ${tentativa} de encontrar moedas...`);
      
      const moedasEncontradas = await page.evaluate(() => {
        const botoes = document.querySelectorAll('button');
        const resultados = [];
        
        botoes.forEach(botao => {
          if (botao.offsetWidth > 0 && botao.offsetHeight > 0) {
            const texto = botao.textContent?.trim();
            if (texto && (/^\d+$/.test(texto) || texto.toLowerCase().includes('claim') || texto.includes('Ganhe'))) {
              resultados.push(texto);
              botao.click();
            }
          }
        });
        
        return resultados;
      });
      
      totalMoedas += moedasEncontradas.length;
      console.log(`🎯 ${moedasEncontradas.length} moedas encontradas:`, moedasEncontradas);
      
      if (moedasEncontradas.length > 0) {
        await delay(3000);
      }
      
      await page.evaluate(() => window.scrollBy(0, 300));
      await delay(2000);
    }

    console.log(`🎉 TOTAL: ${totalMoedas} moedas resgatadas!`);
    await delay(5000);

    console.log('🎉 🎉 🎉 SUCESSO TOTAL!');
    console.log('💡 Navegador ficará aberto - feche manualmente');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

botRapido();