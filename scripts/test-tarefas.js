// scripts/test-tarefas.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT - Versão GitHub Actions (Inglês)');

// 🔥 DETECTAR AMBIENTE
const isCI = process.env.CI === 'true';

// 🔥 CONFIGURAR PASTA DE SCREENSHOTS
function setupScreenshotsDir() {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Pasta screenshots criada:', screenshotsDir);
  }
  return screenshotsDir;
}

// 🔥 SISTEMA DE SCREENSHOTS MELHORADO
let screenshotCount = 0;
const screenshotsDir = setupScreenshotsDir();

async function takeScreenshot(page, description) {
  try {
    screenshotCount++;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeDescription = description.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    const filename = `${screenshotCount.toString().padStart(3, '0')}-${timestamp}-${safeDescription}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    await page.screenshot({ 
      path: filepath, 
      fullPage: true
    });
    
    console.log(`📸 Screenshot ${screenshotCount}: ${description}`);
    console.log(`   📁 Salvo em: ${filename}`);
    return filepath;
  } catch (error) {
    console.log(`❌ Erro ao tirar screenshot: ${error.message}`);
    return null;
  }
}

// 🔥 CONFIGURAÇÃO DE CREDENCIAIS
const ALIEXPRESS_EMAIL = process.env.ALIEXPRESS_EMAIL;
const ALIEXPRESS_PASSWORD = process.env.ALIEXPRESS_PASSWORD;

console.log('🔐 Configuração de login:');
console.log('   Email:', ALIEXPRESS_EMAIL ? '*** Configurado ***' : 'Não configurado');
console.log('   Senha:', ALIEXPRESS_PASSWORD ? '*** Configurada ***' : 'Não configurada');

async function botEventosReais() {
  const browser = await puppeteer.launch({
    headless: isCI ? "new" : false,
    executablePath: isCI ? '/usr/bin/google-chrome' : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true
    },
    args: [
      '--window-size=390,844',
      '--disable-blink-features=AutomationControlled',
      '--disable-notifications',
      '--disable-password-manager-reauthentication',
      // 🔥 FORÇAR INGLÊS
      '--lang=en-US',
      '--accept-lang=en-US,en',
      // Otimizações CI
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--user-agent=Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  // 🔥 CONFIGURAÇÃO DE IDIOMA INGLÊS
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'userLanguage', { get: () => 'en-US' });
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
  
  console.log('📱 Ambiente configurado (Inglês)!');

  const URL_MOEDAS = 'https://m.aliexpress.com/p/coin-index/index.html?utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL&_mobile=1&_is_mobile=1';
  const tarefasConcluidas = new Set();
  const contadorTarefas = new Map();

  // 🔥 NOMES DAS TAREFAS EM INGLÊS (BASEADO NOS SCREENSHOTS)
  const TAREFAS_INGLES = {
    DAILY_CHECKIN: 'Daily check-in',
    BROWSE_SURPRISE_ITEMS: 'Browse surprise items',
    EXPLORE_SPONSORED_ITEMS: 'Explore sponsored items',
    VIEW_COINS_SAVINGS_RECAP: 'View your "Coins Savings Recap"',
    VIEW_SUPER_DISCOUNTS: 'View Super discounts'
  };

  // 🔥 TAREFAS QUE PODEM SER EXECUTADAS MÚLTIPLAS VEZES
  const tarefasMultiplas = new Set([TAREFAS_INGLES.VIEW_SUPER_DISCOUNTS, TAREFAS_INGLES.EXPLORE_SPONSORED_ITEMS]);

  try {
    // === LOGIN ===
    console.log('1. 🔐 Navegando para login...');
    await page.goto('https://login.aliexpress.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await takeScreenshot(page, 'login-page');
    await delay(4000);

    // Email
    console.log('2. 📧 Inserindo email...');
    const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    if (emailInput) {
      await emailInput.type(ALIEXPRESS_EMAIL, { delay: 100 });
      await takeScreenshot(page, 'email-entered');
      await delay(2000);
      await page.keyboard.press('Tab');
    }

    await delay(2000);

    // Botão Continuar
    console.log('3. 🔘 Clicando em Continue...');
    const continueBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('continue');
      });
    });
    if (continueBtn.asElement()) {
      await continueBtn.asElement().click();
      await takeScreenshot(page, 'clicked-continue');
    }

    await delay(5000);

    // Senha
    console.log('4. 🔑 Inserindo senha...');
    const senhaInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    if (senhaInput) {
      await senhaInput.type(ALIEXPRESS_PASSWORD, { delay: 80 });
      await takeScreenshot(page, 'password-entered');
    }

    await delay(2000);

    // Botão Login
    console.log('5. 🔘 Clicando em Sign In...');
    const signInBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('sign in') || texto.includes('login');
      });
    });
    if (signInBtn.asElement()) {
      await signInBtn.asElement().click();
      await takeScreenshot(page, 'clicked-signin');
    }

    console.log('⏳ Aguardando login... 15 segundos');
    await delay(15000);
    await takeScreenshot(page, 'after-login');

    // Navegar para moedas
    console.log('6. 🪙 Indo para coins page...');
    await page.goto(URL_MOEDAS, {
      waitUntil: 'networkidle2',
      timeout: 20000
    });
    await takeScreenshot(page, 'coins-page');

    // Remover popup de senha
    console.log('🗑️ Removendo popups...');
    await delay(10000);
    await removerPopupSalvarSenhaAgressivo(page);
    await takeScreenshot(page, 'after-popup-removal');
    await delay(3000);

    // === ESTRATÉGIA COM TEMPO LIMITE ===
    console.log('7. 🔥 Iniciando execução com tempo limite de 3 minutos...\n');
    
    // 🔥 COLETAR MOEDAS DIÁRIAS SE DISPONÍVEL
    await coletarMoedasDiarias(page);
    await takeScreenshot(page, 'after-collecting-coins');
    
    // 🔥 TEMPO LIMITE DE 3 MINUTOS (180 segundos)
    const tempoLimite = 0.3 * 60 * 1000;
    const inicio = Date.now();
    
    // 🔥 EXECUTAR LOOP POR ATÉ 3 MINUTOS
    let rodada = 0;
    
    while (Date.now() - inicio < tempoLimite) {
      rodada++;
      console.log(`\n🔄 Rodada ${rodada} - Tempo restante: ${Math.round((tempoLimite - (Date.now() - inicio)) / 1000)}s`);
      
      // 🔥 ABRIR MODAL DE TAREFAS
      const modalAberto = await abrirModalTarefas(page);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal, tentando novamente...');
        await takeScreenshot(page, 'modal-not-opened');
        await delay(5000);
        continue;
      }
      
      await takeScreenshot(page, 'modal-opened');
      
      // 🔥 OBTER TAREFAS DISPONÍVEIS
      let tarefasDisponiveis = [];
      try {
        tarefasDisponiveis = await obterTarefasDisponiveis(page);
      } catch (error) {
        console.log('❌ Erro ao obter tarefas:', error.message);
        await takeScreenshot(page, 'error-getting-tasks');
        await delay(5000);
        continue;
      }
      
      if (!Array.isArray(tarefasDisponiveis) || tarefasDisponiveis.length === 0) {
        console.log('ℹ️ Nenhuma tarefa disponível no momento');
        await takeScreenshot(page, 'no-tasks-available');
        await delay(5000);
        continue;
      }
      
      console.log(`📋 Tarefas disponíveis: ${tarefasDisponiveis.length}`);
      tarefasDisponiveis.forEach(t => console.log(`   - ${t.nome}`));
      
      // 🔥 EXECUTAR CADA TAREFA
      let tarefasExecutadas = 0;
      
      for (const tarefa of tarefasDisponiveis) {
        // 🔥 VERIFICAR TEMPO LIMITE A CADA TAREFA
        if (Date.now() - inicio >= tempoLimite) {
          console.log('⏰ Tempo limite de 3 minutos atingido!');
          break;
        }
        
        console.log(`\n🎯 EXECUTANDO: ${tarefa.nome}`);
        
        // 🔥 ATUALIZAR CONTADOR DE EXECUÇÕES
        const execucoes = contadorTarefas.get(tarefa.nome) || 0;
        contadorTarefas.set(tarefa.nome, execucoes + 1);
        
        // 🔥 VERIFICAR SE TAREFA JÁ FOI REALMENTE CONCLUÍDA
        if (tarefasConcluidas.has(tarefa.nome) && !tarefasMultiplas.has(tarefa.nome)) {
          console.log(`✅ ${tarefa.nome} - JÁ CONCLUÍDA (ignorando)`);
          continue;
        }
        
        const success = await executarTarefaEspecifica(page, tarefa, URL_MOEDAS);
        
        if (success) {
          console.log(`✅ ${tarefa.nome} - EXECUTADA COM SUCESSO (${execucoes + 1} execuções)`);
          tarefasExecutadas++;
          
          // 🔥 SISTEMA INTELIGENTE - SÓ MARCA COMO CONCLUÍDA QUANDO REALMENTE TERMINOU
          if (tarefa.nome === TAREFAS_INGLES.BROWSE_SURPRISE_ITEMS) {
            if (execucoes + 1 >= 2) {
              console.log(`🎉 ${tarefa.nome} - 2 EXECUÇÕES COMPLETAS! Marcando como CONCLUÍDA`);
              tarefasConcluidas.add(tarefa.nome);
            }
          } else if (tarefasMultiplas.has(tarefa.nome)) {
            console.log(`🔄 ${tarefa.nome} - Tarefa múltipla, continuará executando`);
          } else {
            console.log(`🎉 ${tarefa.nome} - CONCLUÍDA`);
            tarefasConcluidas.add(tarefa.nome);
          }
          
          await delay(2000);
        } else {
          console.log(`❌ ${tarefa.nome} - FALHOU`);
        }
      }
      
      if (tarefasExecutadas === 0) {
        console.log('ℹ️ Nenhuma tarefa nova pôde ser executada nesta rodada');
      }
      
      // Pequena pausa entre rodadas
      await delay(3000);
    }

    console.log('\n⏰ TEMPO LIMITE DE 3 MINUTOS ATINGIDO!');
    console.log('🎉 PROCESSO PRINCIPAL CONCLUÍDO!');
    console.log('📊 Estatísticas finais:');
    console.log('   - Tarefas completamente concluídas:', Array.from(tarefasConcluidas));
    console.log('   - Contador de execuções por tarefa:', Object.fromEntries(contadorTarefas));

    // 🔥 EXECUÇÃO ESPECIAL PARA "BROWSE SURPRISE ITEMS"
    await executarBrowseSurpriseItemsFinal(page, URL_MOEDAS);

    console.log('\n🏁 TODAS AS TAREFAS FINALIZADAS!');
    await takeScreenshot(page, 'finalization');
    
  } catch (error) {
    console.error('💥 Erro:', error.message);
    await takeScreenshot(page, 'critical-error');
  } finally {
    // 🔥 VERIFICAR SCREENSHOTS ANTES DE FECHAR
    console.log('\n📁 VERIFICANDO SCREENSHOTS SALVOS...');
    try {
      const files = fs.readdirSync(screenshotsDir);
      console.log(`✅ ${files.length} screenshots salvos em: ${screenshotsDir}`);
      if (files.length > 0) {
        console.log('📄 Lista de screenshots:');
        files.forEach(file => {
          const filePath = path.join(screenshotsDir, file);
          const stats = fs.statSync(filePath);
          console.log(`   📸 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        });
      }
    } catch (error) {
      console.log('❌ Nenhum screenshot encontrado ou erro ao listar:', error.message);
    }
    
    await browser.close();
    console.log('🔚 Navegador fechado.');
  }
}

// 🔥 OBTER TAREFAS DISPONÍVEIS (ATUALIZADO PARA INGLÊS)
async function obterTarefasDisponiveis(page) {
  try {
    const tarefas = await page.evaluate(() => {
      try {
        const resultados = [];
        
        // 🔥 PROCURA POR ELEMENTOS DE TAREFA - ESTRATÉGIA MAIS AMPLA
        const elementosTarefa = document.querySelectorAll('[class*="task"], [class*="Task"], .e2e_normal_task, .task-item, .task-card');
        
        for (let elemento of elementosTarefa) {
          try {
            // Procura por título da tarefa
            const tituloElement = elemento.querySelector('[class*="title"], [class*="name"], .task-title, .task-name');
            // Procura por botão de ação
            const botaoElement = elemento.querySelector('button, [class*="btn"], [class*="button"], .e2e_normal_task_right_btn');
            
            if (tituloElement && botaoElement) {
              const nome = tituloElement.textContent.trim();
              const botaoVisivel = botaoElement.offsetWidth > 0 && botaoElement.offsetHeight > 0;
              const botaoHabilitado = botaoElement.disabled !== true && botaoElement.style.display !== 'none';
              
              const textoBotao = botaoElement.textContent.trim();
              const botaoDisponivel = textoBotao === 'Go' || textoBotao === 'Start' || textoBotao === 'Play';
              
              if (botaoVisivel && botaoHabilitado && botaoDisponivel) {
                resultados.push({
                  nome: nome,
                  elemento: 'botao_disponivel'
                });
              }
            }
          } catch (e) {
            console.log('Erro ao processar tarefa individual:', e);
          }
        }
        
        // 🔥 SE NÃO ENCONTROU COM SELETORES ESPECÍFICOS, TENTA ESTRATÉGIA MAIS GENÉRICA
        if (resultados.length === 0) {
          console.log('🔍 Tentando estratégia genérica para encontrar tarefas...');
          const todosBotoes = Array.from(document.querySelectorAll('button'));
          const botoesGo = todosBotoes.filter(btn => {
            const texto = btn.textContent.trim();
            return (texto === 'Go' || texto === 'Start') && 
                   btn.offsetWidth > 0 && 
                   btn.offsetHeight > 0 &&
                   btn.disabled !== true;
          });
          
          for (let btn of botoesGo) {
            // Tenta encontrar o texto da tarefa próximo ao botão
            const container = btn.closest('div, li, section');
            if (container) {
              const textos = Array.from(container.querySelectorAll('span, div, p')).filter(el => 
                el.textContent.trim().length > 10 && 
                !el.textContent.includes('Go') && 
                !el.textContent.includes('Start')
              );
              
              if (textos.length > 0) {
                resultados.push({
                  nome: textos[0].textContent.trim(),
                  elemento: 'botao_go_genérico'
                });
              }
            }
          }
        }
        
        return resultados;
      } catch (e) {
        console.log('Erro no evaluate:', e);
        return [];
      }
    });
    
    console.log(`🔍 Encontradas ${tarefas.length} tarefas disponíveis`);
    return tarefas || [];
  } catch (error) {
    console.log('❌ Erro ao obter tarefas:', error.message);
    return [];
  }
}

// 🔥 EXECUTAR TAREFA ESPECÍFICA (ATUALIZADO PARA INGLÊS)
async function executarTarefaEspecifica(page, tarefa, urlMoedas) {
  try {
    // 🔥 CLICAR NA TAREFA ESPECÍFICA
    console.log(`   🔍 Clicando em: ${tarefa.nome}`);
    const clicked = await clicarTarefaEspecifica(page, tarefa.nome);
    if (!clicked) return false;

    await delay(3000);
    await takeScreenshot(page, `clicked-task-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);

    // 🔥 VERIFICAR SE MUDOU DE PÁGINA
    const urlAtual = page.url();
    
    if (urlAtual.includes('coin-index')) {
      // Tarefa instantânea (como check-in)
      console.log(`   ✅ Tarefa instantânea concluída`);
      return true;
    } else {
      // Tarefa com navegação
      console.log(`   📱 Navegou para tarefa`);
      await takeScreenshot(page, `task-page-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
      
      // 🔥 IDENTIFICAR TIPO DE TAREFA PELO NOME (INGLÊS)
      if (tarefa.nome.includes('Browse surprise items') || tarefa.nome.includes('surprise items')) {
        await executarBrowseSurpriseItems(page, urlMoedas);
      } else if (tarefa.nome.includes('Explore sponsored items') || tarefa.nome.includes('sponsored')) {
        // Tarefas com espera de 19 segundos
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await takeScreenshot(page, `before-back-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      } else if (tarefa.nome.includes('View Super discounts') || tarefa.nome.includes('Super discounts')) {
        // Tarefas com espera de 19 segundos
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await takeScreenshot(page, `before-back-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      } else if (tarefa.nome.includes('Coins Savings Recap')) {
        // Tarefa extrato de moedas (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `before-back-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      } else {
        // Tarefa genérica (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `before-back-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`   💥 Erro em ${tarefa.nome}:`, error.message);
    await takeScreenshot(page, `error-task-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
    
    try {
      await voltarParaMoedas(page, urlMoedas);
    } catch (e) {}
    
    return false;
  }
}

// 🔥 EXECUTAR BROWSE SURPRISE ITEMS (ATUALIZADO)
async function executarBrowseSurpriseItems(page, urlMoedas) {
  console.log('   🎁 Executando Browse surprise items (3 produtos)...');
  
  // 🔥 AGUARDAR PÁGINA CARREGAR COMPLETAMENTE
  console.log('   ⏳ Aguardando carregamento da página...');
  await delay(6000);
  await takeScreenshot(page, 'browse-items-loaded');
  
  // 🔥 CLICA EM 3 PRODUTOS DIFERENTES
  for (let i = 1; i <= 3; i++) {
    console.log(`   👆 Procurando ${i}º produto...`);
    
    const clicked = await page.evaluate((index) => {
      try {
        // Pega todos os elementos que parecem produtos
        const produtos = Array.from(document.querySelectorAll('a, div[class*="product"], div[class*="item"], [class*="card"], [class*="product-click"]'));
        
        // Filtra apenas os visíveis
        const produtosVisiveis = produtos.filter(el => {
          const rect = el.getBoundingClientRect();
          const estaVisivel = rect.width > 0 && rect.height > 0 && rect.top > 0;
          const estaNaTela = rect.top < window.innerHeight && rect.bottom > 0;
          
          return estaVisivel && estaNaTela;
        });
        
        console.log(`🔍 Encontrados ${produtosVisiveis.length} produtos visíveis`);
        
        if (produtosVisiveis.length > 0) {
          // Seleciona produto por índice (evita cliques repetidos)
          const produtoIndex = Math.min(index - 1, produtosVisiveis.length - 1);
          const produto = produtosVisiveis[produtoIndex];
          
          console.log(`🎯 Clicando no produto ${produtoIndex + 1}`);
          produto.scrollIntoView({ behavior: 'smooth', block: 'center' });
          produto.click();
          return true;
        } else {
          console.log(`❌ Não encontrou produtos visíveis`);
          return false;
        }
      } catch (e) {
        console.log('Erro ao clicar no produto:', e);
        return false;
      }
    }, i);

    if (clicked) {
      console.log(`   ✅ Produto ${i} clicado`);
      await delay(4000);
      await takeScreenshot(page, `product-${i}-clicked`);
      
      // Volta para a lista de produtos
      console.log('   ↩️ Voltando para lista de produtos...');
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
      await delay(3000);
      await takeScreenshot(page, `back-to-list-${i}`);
    } else {
      console.log(`   ❌ Produto ${i} não encontrado, tentando próximo...`);
      
      // Tenta scroll para ver mais produtos
      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });
      await delay(2000);
    }
  }
  
  // 🔥 VOLTA PARA MOEDAS APÓS OS 3 PRODUTOS
  console.log('   🔄 Voltando para moedas...');
  await voltarParaMoedas(page, urlMoedas);
}

// 🔥 VOLTAR PARA PÁGINA DE MOEDAS
async function voltarParaMoedas(page, urlMoedas) {
  try {
    console.log('   ↩️ Voltando para coins...');
    
    try {
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
      await delay(3000);
      
      const url = page.url();
      if (url.includes('coin-index')) {
        console.log('   ✅ Voltou com sucesso');
        await takeScreenshot(page, 'back-to-coins-success');
        return true;
      }
    } catch (e) {}
    
    await page.goto(urlMoedas, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await delay(3000);
    await takeScreenshot(page, 'navigated-to-coins');
    
    console.log('   ✅ Página de coins carregada');
    return true;
  } catch (error) {
    console.log('   ❌ Erro ao voltar para coins:', error.message);
    await takeScreenshot(page, 'error-back-to-coins');
    return false;
  }
}

// 🔥 CLICAR TAREFA ESPECÍFICA (ATUALIZADO PARA INGLÊS)
async function clicarTarefaEspecifica(page, nomeTarefa) {
  try {
    const sucesso = await page.evaluate((nome) => {
      try {
        // 🔥 ESTRATÉGIA 1: Procurar por elementos de tarefa
        const elementosTarefa = document.querySelectorAll('[class*="task"], [class*="Task"], .e2e_normal_task, .task-item');
        
        for (let elemento of elementosTarefa) {
          const titulo = elemento.querySelector('[class*="title"], [class*="name"], .task-title');
          if (titulo && titulo.textContent.trim() === nome) {
            const botao = elemento.querySelector('button, [class*="btn"], [class*="button"]');
            if (botao && botao.offsetWidth > 0) {
              botao.click();
              return true;
            }
          }
        }
        
        // 🔥 ESTRATÉGIA 2: Procurar por botões "Go" próximos ao texto
        const todosBotoes = Array.from(document.querySelectorAll('button'));
        const botoesGo = todosBotoes.filter(btn => {
          const textoBtn = btn.textContent.trim();
          return textoBtn === 'Go' || textoBtn === 'Start';
        });
        
        for (let btn of botoesGo) {
          // Procura texto da tarefa próximo ao botão
          const container = btn.closest('div, li, section');
          if (container) {
            const textos = Array.from(container.querySelectorAll('span, div, p'));
            for (let textoEl of textos) {
              if (textoEl.textContent.trim() === nome) {
                btn.click();
                return true;
              }
            }
          }
        }
        
        return false;
      } catch (e) {
        console.log('Erro ao clicar na tarefa:', e);
        return false;
      }
    }, nomeTarefa);

    return sucesso;
  } catch (error) {
    console.log(`   ❌ Erro ao clicar:`, error.message);
    return false;
  }
}

// 🔥 COLETAR MOEDAS DIÁRIAS
async function coletarMoedasDiarias(page) {
  try {
    console.log('💰 Verificando coins para coletar...');
    
    const coletou = await page.evaluate(() => {
      const botoes = Array.from(document.querySelectorAll('button, div, span'));
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
        if (texto.includes('collect') || texto.includes('check-in')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (coletou) {
      console.log('✅ Coins coletadas!');
      await delay(3000);
    }
  } catch (error) {
    // Ignora erro
  }
}

// 🔥 ABRIR MODAL DE TAREFAS
async function abrirModalTarefas(page) {
  try {
    const modalAberto = await verificarModalAberto(page);
    if (modalAberto) {
      return true;
    }
    
    // 🔥 TENTA CLICAR NO BOTÃO DE TAREFAS/COINS
    const cliqueu = await page.evaluate(() => {
      try {
        // Procura por botões relacionados a tasks/coins
        const botoes = Array.from(document.querySelectorAll('button, div, span'));
        const botoesAlvo = botoes.filter(btn => {
          const texto = btn.textContent?.toLowerCase() || '';
          const html = btn.innerHTML?.toLowerCase() || '';
          return texto.includes('task') || texto.includes('mission') || 
                 html.includes('task') || html.includes('mission') ||
                 btn.className.includes('task') || btn.className.includes('mission');
        });
        
        if (botoesAlvo.length > 0) {
          botoesAlvo[0].click();
          return true;
        }
        
        // Se não encontrou, tenta clicar em qualquer área que possa abrir o modal
        const elementosClickaveis = document.querySelectorAll('[class*="coin"], [class*="task"], [class*="mission"]');
        for (let el of elementosClickaveis) {
          if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            el.click();
            return true;
          }
        }
        
        return false;
      } catch (e) {
        return false;
      }
    });
    
    if (cliqueu) {
      await delay(5000);
      return await verificarModalAberto(page);
    }
    
    return false;
  } catch (error) {
    console.log('❌ Erro ao abrir modal:', error.message);
    return false;
  }
}

// 🔥 FUNÇÕES AUXILIARES
async function verificarModalAberto(page) {
  try {
    return await page.evaluate(() => {
      try {
        // Procura por elementos que parecem modais
        const modais = document.querySelectorAll('[class*="modal"], [class*="Modal"], [class*="dialog"], [class*="popup"]');
        for (let modal of modais) {
          if (modal.offsetWidth > 0 && modal.offsetHeight > 0) {
            return true;
          }
        }
        
        // Procura por elementos com texto de tarefas
        const elementosTarefa = document.querySelectorAll('[class*="task"], [class*="Task"]');
        return elementosTarefa.length > 0;
      } catch (e) {
        return false;
      }
    });
  } catch (error) {
    return false;
  }
}

async function removerPopupSalvarSenhaAgressivo(page) {
  try {
    const popupFechado = await page.evaluate(() => {
      try {
        // 🔥 PRIMEIRO: Tenta encontrar e clicar no "X" para fechar
        const elementosFechar = Array.from(document.querySelectorAll('div, button, span'));
        const xButtons = elementosFechar.filter(el => {
          const texto = el.textContent?.trim() || '';
          const html = el.innerHTML?.toLowerCase() || '';
          
          // Procura por "X", ícones de fechar, ou elementos com classes de fechar
          return texto === '×' || texto === '✕' || texto === '✖' || 
                 texto === 'X' || html.includes('close') || 
                 el.className.includes('close');
        });
        
        if (xButtons.length > 0) {
          for (let xBtn of xButtons) {
            if (xBtn.offsetWidth > 0 && xBtn.offsetHeight > 0) {
              xBtn.click();
              return true;
            }
          }
        }
        
        // 🔥 SEGUNDO: Tenta clicar em áreas vazias/overlay para fechar
        const overlays = Array.from(document.querySelectorAll('div[style*="background"], div[class*="overlay"], div[class*="mask"]'));
        for (let overlay of overlays) {
          const style = window.getComputedStyle(overlay);
          if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
              style.position === 'fixed' && 
              overlay.offsetWidth > 100) {
            overlay.click();
            return true;
          }
        }
        
        // 🔥 TERCEIRO: Tenta botões de texto ("never", "nunca", etc)
        const textosParaClicar = ['never', 'not now', 'cancel', 'later'];
        const todosBotoes = Array.from(document.querySelectorAll('button, div, span, a'));
        
        for (let btn of todosBotoes) {
          const texto = btn.textContent?.toLowerCase() || '';
          for (let textoAlvo of textosParaClicar) {
            if (texto.includes(textoAlvo) && btn.offsetWidth > 0 && btn.offsetHeight > 0) {
              btn.click();
              return true;
            }
          }
        }
        
        return false;
      } catch (e) {
        return false;
      }
    });

    if (popupFechado) {
      console.log('✅ Popup fechado com sucesso');
      await delay(2000);
    } else {
      console.log('ℹ️ Nenhum popup encontrado para fechar');
    }
  } catch (error) {
    console.log('ℹ️ Erro ao tentar fechar popup:', error.message);
  }
}

// 🔥 FUNÇÃO EXCLUSIVA PARA BROWSE SURPRISE ITEMS - AJUSTE FINAL
async function executarBrowseSurpriseItemsFinal(page, urlMoedas) {
  console.log('\n🎯 INICIANDO EXECUÇÃO ESPECIAL PARA "BROWSE SURPRISE ITEMS"');
  
  try {
    for (let execucao = 1; execucao <= 2; execucao++) {
      console.log(`\n🔁 Execução ${execucao}/2 da tarefa especial...`);
      
      // 🔥 ABRIR MODAL
      console.log('1. 📱 Abrindo modal de tarefas...');
      const modalAberto = await abrirModalTarefas(page);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal');
        continue;
      }
      await delay(3000);
      await takeScreenshot(page, `modal-opened-special-${execucao}`);
      
      // 🔥 CLICAR EM "BROWSE SURPRISE ITEMS"
      console.log('2. 🔍 Clicando em "Browse surprise items"...');
      const tarefaEncontrada = await clicarTarefaEspecifica(page, 'Browse surprise items');
      
      if (!tarefaEncontrada) {
        console.log('❌ Tarefa "Browse surprise items" não encontrada');
        continue;
      }
      
      console.log('3. 🚀 Executando tarefa...');
      await delay(6000);
      await takeScreenshot(page, 'browse-items-page');
      
      // 🔥 EXECUTAR A TAREFA NA MESMA ABA
      await executarBrowseSurpriseItems(page, urlMoedas);
      
      console.log(`🎉 Execução ${execucao}/2 concluída!`);
      
      if (execucao < 2) {
        console.log('🔄 Pronto para próxima execução...');
        await delay(3000);
      }
    }
    
    console.log('🎉 EXECUÇÃO ESPECIAL "BROWSE SURPRISE ITEMS" CONCLUÍDA!');
    
  } catch (error) {
    console.log('💥 Erro na execução especial:', error.message);
    await takeScreenshot(page, 'error-special-execution');
  }
}

// Executar o bot
if (require.main === module) {
  botEventosReais().catch(console.error);
}
