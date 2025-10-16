// scripts/automacao-final.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function automacaoFinal() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
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
    await page.screenshot({ path: 'final-1-inicio.png' });

    // **Estratégia: Buscar e clicar no ícone de login**
    console.log('2. 👤 Procurando ícone de login/conta...');
    
    // Primeiro, vamos listar todos os elementos clicáveis na área superior
    const elementosSuperiores = await page.evaluate(() => {
      const elementos = [];
      // Área do header (primeiros 100px de altura)
      const todosElementos = document.querySelectorAll('*');
      
      todosElementos.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < 100 && rect.width > 0 && rect.height > 0) {
          const texto = el.textContent?.trim();
          if (texto && texto.length > 0) {
            elementos.push({
              tag: el.tagName,
              texto: texto,
              classe: el.className,
              top: rect.top,
              left: rect.left
            });
          }
        }
      });
      
      return elementos;
    });

    console.log('🔍 Elementos no header:');
    elementosSuperiores.forEach(el => {
      if (el.texto.length < 50) { // Filtrar textos muito longos
        console.log(`   - ${el.tag}: "${el.texto}" [${el.classe}]`);
      }
    });

    // **Tentar encontrar e clicar no ícone de conta**
    console.log('3. 🖱️ Tentando clicar no ícone da conta...');
    
    const seletoresConta = [
      'span:has-text("Account")',
      'span:has-text("Sign in")', 
      'a:has-text("Account")',
      'a:has-text("Sign in")',
      'div[class*="account"]',
      'div[class*="user"]',
      'button[class*="account"]'
    ];

    let contaClicada = false;
    for (const selector of seletoresConta) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`✅ Clicado: ${selector}`);
        contaClicada = true;
        await delay(3000);
        break;
      } catch (e) {
        // Continuar
      }
    }

    if (!contaClicada) {
      console.log('🔄 Tentando clicar por coordenadas (canto superior direito)...');
      // Clicar em várias posições no canto superior direito
      const coordenadas = [[1200, 30], [1150, 30], [1250, 30], [1200, 60]];
      
      for (const [x, y] of coordenadas) {
        try {
          await page.mouse.click(x, y);
          console.log(`🖱️ Clicado em x:${x}, y:${y}`);
          await delay(2000);
          break;
        } catch (e) {
          // Continuar
        }
      }
    }

    await page.screenshot({ path: 'final-2-pos-clique-conta.png' });

    // **Preencher formulário de login no modal**
    console.log('4. 🔐 Preenchendo formulário de login...');
    await delay(2000);

    // Estratégia agressiva para encontrar campos
    const loginPreenchido = await page.evaluate((email, password) => {
      // Buscar todos os inputs
      const inputs = Array.from(document.querySelectorAll('input'));
      let emailPreenchido = false;
      let senhaPreenchida = false;
      
      for (let input of inputs) {
        if (!emailPreenchido && (input.type === 'email' || 
                                input.type === 'text' ||
                                input.placeholder?.toLowerCase().includes('email') ||
                                input.placeholder?.toLowerCase().includes('mail'))) {
          input.value = email;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          emailPreenchido = true;
          console.log('✅ Email preenchido');
        }
        
        if (!senhaPreenchida && input.type === 'password') {
          input.value = password;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          senhaPreenchida = true;
          console.log('✅ Senha preenchida');
        }
      }
      
      return emailPreenchido && senhaPreenchida;
    }, process.env.ALIEXPRESS_EMAIL, process.env.ALIEXPRESS_PASSWORD);

    if (loginPreenchido) {
      console.log('✅ Credenciais preenchidas!');
      await page.screenshot({ path: 'final-3-credenciais-preenchidas.png' });

      // Clicar no botão de submit
      console.log('5. 🖱️ Clicando em submit...');
      await page.evaluate(() => {
        const botoes = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        for (let btn of botoes) {
          if (btn.type === 'submit' || 
              btn.textContent?.toLowerCase().includes('sign in') ||
              btn.textContent?.toLowerCase().includes('login') ||
              btn.textContent?.toLowerCase().includes('entrar')) {
            btn.click();
            console.log('✅ Botão de login clicado');
            return;
          }
        }
        
        // Se não encontrou, clicar no primeiro botão
        if (botoes.length > 0) {
          botoes[0].click();
          console.log('🔄 Primeiro botão clicado');
        }
      });

      console.log('6. ⏳ Aguardando login...');
      await delay(8000);
      await page.screenshot({ path: 'final-4-pos-login.png' });
    } else {
      console.log('❌ Campos de login não encontrados no modal');
    }

    // **Acessar página de moedas**
    console.log('7. 🪙 Acessando página de moedas...');
    await page.goto('https://www.aliexpress.com/coin/task', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await delay(5000);
    await page.screenshot({ path: 'final-5-pagina-moedas.png' });
    console.log('📄 Título moedas:', await page.title());

    // **Resgatar moedas de forma inteligente**
    console.log('8. 🔄 Resgatando moedas...');
    
    const resultado = await page.evaluate(() => {
      const botoesClicados = [];
      
      // Estratégia 1: Buscar por textos específicos
      const textosAlvo = ['claim', 'resgatar', 'receber', 'get', 'collect', 'coin'];
      const botoes = Array.from(document.querySelectorAll('button, [role="button"], .btn, [class*="button"]'));
      
      botoes.forEach(botao => {
        if (botao.offsetWidth > 0 && botao.offsetHeight > 0 && !botao.disabled) {
          const texto = botao.textContent?.toLowerCase().trim() || '';
          const classe = botao.className.toLowerCase();
          
          // Verificar se é um botão de ação
          const ehBotaoAlvo = textosAlvo.some(alvo => texto.includes(alvo)) ||
                             textosAlvo.some(alvo => classe.includes(alvo)) ||
                             /^\d+$/.test(texto) || // Apenas números
                             (texto.length <= 3 && !isNaN(texto)); // Números curtos
          
          if (ehBotaoAlvo) {
            botoesClicados.push({
              texto: botao.textContent?.trim(),
              classe: botao.className
            });
            
            try {
              botao.click();
            } catch (e) {
              // Tentar método alternativo
              botao.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          }
        }
      });
      
      return botoesClicados;
    });

    console.log(`🎯 ${resultado.length} botões clicados:`);
    resultado.forEach((botao, i) => {
      console.log(`   ${i + 1}. "${botao.texto}" [${botao.classe}]`);
    });

    // Aguardar processamento
    await delay(5000);
    await page.screenshot({ path: 'final-6-resultado.png' });

    console.log(`🎉 AUTOMAÇÃO CONCLUÍDA! ${resultado.length} moedas resgatadas.`);

  } catch (error) {
    console.error('💥 Erro:', error);
    await page.screenshot({ path: 'final-erro.png' });
  } finally {
    await browser.close();
  }
}

automacaoFinal().catch(console.error);
