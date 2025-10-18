// bot-ali-inteligente.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT - Sistema com Tempo Limite de 4 Minutos (GitHub Actions)');

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

// 🔥 SISTEMA DE SCREENSHOTS
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
  // 🔥 USER AGENT SIMPLES
  const userAgent = {
    toString: () => 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  };
  console.log('📱 User Agent móvel configurado');

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
      '--lang=pt-BR', // 🔥 FORÇAR IDIOMA PORTUGUÊS NO CHROME
      '--window-size=390,844',
      '--disable-blink-features=AutomationControlled',
      '--disable-notifications',
      '--disable-password-manager-reauthentication',
      // Otimizações CI
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--user-agent=' + userAgent.toString()
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();

  // 🔥 FORÇAR IDIOMA PORTUGUÊS VIA HEADERS HTTP
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' // 🔥 PRIORIDADE PARA PORTUGUÊS
  });

  // 🔥 URL DA PÁGINA DE MOEDAS FORÇANDO IDIOMA
  const URL_MOEDAS = 'https://m.aliexpress.com/p/coin-index/index.html?language=pt_BR&utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL&_mobile=1&_is_mobile=1';

  // 🔥 SISTEMA INTELIGENTE - SÓ MARCA COMO CONCLUÍDA QUANDO REALMENTE TERMINOU
  const tarefasConcluidas = new Set();
  const contadorTarefas = new Map(); // Conta quantas vezes cada tarefa foi executada
  const tarefasMultiplas = new Set(['View Super discounts', 'Explore sponsored items', 'Ver Super descontos', 'Explorar itens patrocinados']); // Tarefas que precisam de múltiplas execuções

  try {
    // 🔥 INTERCEPTA ABERTURA DE NOVAS ABAS
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      delete navigator.chrome;
      Notification.requestPermission = () => Promise.resolve('denied');
      
      window.open = (url) => {
        if (url) window.location.href = url;
        return window;
      };
      
      document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.target === '_blank') {
          e.preventDefault();
          window.location.href = link.href;
        }
      }, true);
    });

    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    console.log('📱 Ambiente configurado!');

    // === VERIFICAR IDIOMA DA PÁGINA ===
    console.log('🌎 Verificando idioma da página...');
    await page.goto('https://m.aliexpress.com', { waitUntil: 'domcontentloaded' });
    const lang = await page.evaluate(() => document.documentElement.lang);
    console.log('🌎 Idioma detectado na página:', lang);
    await takeScreenshot(page, 'verificacao-idioma');

    // === LOGIN ===
    console.log('1. 🔐 Navegando para login...');
    await page.goto('https://login.aliexpress.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await takeScreenshot(page, 'pagina-login');
    await delay(4000);

    // Email
    console.log('2. 📧 Inserindo email...');
    const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    if (emailInput) {
      await emailInput.type(ALIEXPRESS_EMAIL, { delay: 100 });
      await takeScreenshot(page, 'email-inserido');
      await delay(2000);
      await page.keyboard.press('Tab');
    }

    await delay(2000);

    const continueBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('continue') || texto.includes('continuar');
      });
    });
    if (continueBtn.asElement()) {
      await continueBtn.asElement().click();
      await takeScreenshot(page, 'clicou-continuar');
    }

    await delay(5000);

    const senhaInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    if (senhaInput) {
      await senhaInput.type(ALIEXPRESS_PASSWORD, { delay: 80 });
      await takeScreenshot(page, 'senha-inserida');
    }

    await delay(2000);

    const signInBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('sign in') || texto.includes('login') || texto.includes('entrar');
      });
    });
    if (signInBtn.asElement()) {
      await signInBtn.asElement().click();
      await takeScreenshot(page, 'clicou-login');
    }

    console.log('⏳ Aguardando login... 15 segundos');
    await delay(15000);
    await takeScreenshot(page, 'apos-login');

    // Navegar para moedas
    console.log('6. 🪙 Indo para moedas...');
    await page.goto(URL_MOEDAS, {
      waitUntil: 'networkidle2',
      timeout: 20000
    });
    await takeScreenshot(page, 'pagina-moedas');

    // Verificar idioma novamente após login
    const langPosLogin = await page.evaluate(() => document.documentElement.lang);
    console.log('🌎 Idioma após login:', langPosLogin);

    // Remover popup de senha
    console.log('🗑️ Removendo popup de senha...');
    await delay(10000);
    await removerPopupSalvarSenhaAgressivo(page);
    await takeScreenshot(page, 'apos-remover-popup');
    await delay(3000);

    // === ESTRATÉGIA COM TEMPO LIMITE DE 4 MINUTOS ===
    console.log('7. 🔥 Iniciando execução com tempo limite de 4 minutos...\n');
    
    // 🔥 COLETAR MOEDAS DIÁRIAS SE DISPONÍVEL
    await coletarMoedasDiarias(page);
    await takeScreenshot(page, 'apos-coletar-moedas');
    
    // 🔥 TEMPO LIMITE DE 2.5 MINUTOS (150 segundos)
    const tempoLimite = 1.0 * 60 * 1000; // 2.5 minutos em milissegundos
    const inicio = Date.now();
    
    // 🔥 EXECUTAR LOOP POR ATÉ 4 MINUTOS
    let rodada = 0;
    
    while (Date.now() - inicio < tempoLimite) {
      rodada++;
      console.log(`\n🔄 Rodada ${rodada} - Tempo restante: ${Math.round((tempoLimite - (Date.now() - inicio)) / 1000)}s`);
      
      // 🔥 ABRIR MODAL DE TAREFAS
      const modalAberto = await abrirModalTarefas(page);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal, tentando novamente...');
        await takeScreenshot(page, 'modal-nao-aberto');
        await delay(5000);
        continue;
      }
      
      await takeScreenshot(page, 'modal-aberto');
      
      // 🔥 OBTER TAREFAS DISPONÍVEIS (EXCLUINDO JOGOS) - COMPATÍVEL COM PORTUGUÊS E INGLÊS
      let tarefasDisponiveis = [];
      try {
        tarefasDisponiveis = await obterTarefasDisponiveis(page);
      } catch (error) {
        console.log('❌ Erro ao obter tarefas:', error.message);
        await takeScreenshot(page, 'erro-obter-tarefas');
        await delay(5000);
        continue;
      }
      
      if (!Array.isArray(tarefasDisponiveis) || tarefasDisponiveis.length === 0) {
        console.log('ℹ️ Nenhuma tarefa disponível no momento');
        await takeScreenshot(page, 'nenhuma-tarefa-disponivel');
        await delay(5000);
        continue;
      }
      
      // 🔥 FILTRAR TAREFAS - REMOVER JOGOS (COMPATÍVEL AMBOS IDIOMAS)
      const tarefasFiltradas = tarefasDisponiveis.filter(tarefa => {
        if (!tarefa || !tarefa.nome) return false;
        
        // 🔥 EXCLUIR TAREFAS DE JOGO (PORTUGUÊS E INGLÊS)
        const palavrasJogo = ['Tente sua sorte', 'Try your luck', 'Merge Boss', 'game', 'jogo', 'Prize Land', 'tentar sorte'];
        if (palavrasJogo.some(palavra => tarefa.nome.includes(palavra))) {
          console.log(`🚫 Ignorando tarefa de jogo: ${tarefa.nome}`);
          return false;
        }
        
        return true;
      });
      
      if (tarefasFiltradas.length === 0) {
        console.log('ℹ️ Nenhuma tarefa útil disponível após filtrar jogos');
        await takeScreenshot(page, 'tarefas-filtradas-vazia');
        await delay(5000);
        continue;
      }
      
      console.log(`📋 Tarefas disponíveis: ${tarefasFiltradas.length}`);
      
      // 🔥 EXECUTAR CADA TAREFA FILTRADA
      let tarefasExecutadas = 0;
      
      for (const tarefa of tarefasFiltradas) {
        // 🔥 VERIFICAR TEMPO LIMITE A CADA TAREFA
        if (Date.now() - inicio >= tempoLimite) {
          console.log('⏰ Tempo limite de 4 minutos atingido!');
          break;
        }
        
        console.log(`\n🎯 EXECUTANDO: ${tarefa.nome}`);
        
        // 🔥 ATUALIZAR CONTADOR DE EXECUÇÕES
        const execucoes = contadorTarefas.get(tarefa.nome) || 0;
        contadorTarefas.set(tarefa.nome, execucoes + 1);
        
        // 🔥 VERIFICAR SE TAREFA JÁ FOI REALMENTE CONCLUÍDA
        if (tarefasConcluidas.has(tarefa.nome)) {
          console.log(`✅ ${tarefa.nome} - JÁ CONCLUÍDA (ignorando)`);
          continue;
        }
        
        const success = await executarTarefaEspecifica(page, tarefa, URL_MOEDAS);
        
        if (success) {
          console.log(`✅ ${tarefa.nome} - EXECUTADA COM SUCESSO (${execucoes + 1} execuções)`);
          tarefasExecutadas++;
          
          // 🔥 SISTEMA INTELIGENTE - SÓ MARCA COMO CONCLUÍDA QUANDO REALMENTE TERMINOU
          if (tarefa.nome.includes('Browse surprise items') || tarefa.nome.includes('Navegar por itens surpresa')) {
            // "Browse surprise items" precisa de 2 execuções
            if (execucoes + 1 >= 2) {
              console.log(`🎉 ${tarefa.nome} - 2 EXECUÇÕES COMPLETAS! Marcando como CONCLUÍDA`);
              tarefasConcluidas.add(tarefa.nome);
            }
          } else if (tarefasMultiplas.has(tarefa.nome)) {
            // Tarefas que precisam de múltiplas execuções NUNCA são marcadas como concluídas automaticamente
            // Elas continuarão aparecendo até que o tempo limite de 4 minutos acabe
            console.log(`🔄 ${tarefa.nome} - Tarefa múltipla, continuará executando`);
          } else {
            // Tarefas normais são marcadas como concluídas após 1 execução
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

    console.log('\n⏰ TEMPO LIMITE DE 2.5 MINUTOS ATINGIDO!');
    console.log('🎉 PROCESSO PRINCIPAL CONCLUÍDO!');
    console.log('📊 Estatísticas finais:');
    console.log('   - Tarefas completamente concluídas:', Array.from(tarefasConcluidas));
    console.log('   - Contador de execuções por tarefa:', Object.fromEntries(contadorTarefas));

    // 🔥 EXECUÇÃO ESPECIAL PARA "BROWSE SURPRISE ITEMS" / "NAVEGAR POR ITENS SURPRESA"
    await executarBrowseSurpriseItemsFinal(page, URL_MOEDAS);

    console.log('\n🏁 TODAS AS TAREFAS FINALIZADAS!');
    await takeScreenshot(page, 'finalizacao');
    
  } catch (error) {
    console.error('💥 Erro:', error.message);
    await takeScreenshot(page, 'erro-critico');
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

// 🔥 OBTER TAREFAS DISPONÍVEIS (COMPATÍVEL COM PORTUGUÊS E INGLÊS)
async function obterTarefasDisponiveis(page) {
  try {
    const tarefas = await page.evaluate(() => {
      try {
        const resultados = [];
        
        // 🔥 ESTRATÉGIA MAIS AMPLA - PROCURA POR TODOS OS BOTÕES "Go" EM AMBOS IDIOMAS
        const todosBotoes = Array.from(document.querySelectorAll('button'));
        const botoesGo = todosBotoes.filter(btn => {
          const texto = btn.textContent?.trim() || '';
          // 🔥 ACEITA "Go", "GO", "Ir" - AMBOS IDIOMAS
          return ['Go', 'GO', 'Ir'].includes(texto) && 
                 btn.offsetWidth > 0 && 
                 btn.offsetHeight > 0 &&
                 btn.disabled !== true;
        });
        
        console.log(`🔍 Encontrados ${botoesGo.length} botões "Go/Ir"`);
        
        for (let btn of botoesGo) {
          try {
            // 🔥 PROCURA O TEXTO DA TAREFA PRÓXIMO AO BOTÃO
            const container = btn.closest('div, li, section, [class*="task"], [class*="item"]');
            if (container) {
              // Procura por texto que descreve a tarefa (texto mais longo)
              const textos = Array.from(container.querySelectorAll('span, div, p, h3, h4')).filter(el => {
                const texto = el.textContent?.trim() || '';
                return texto.length > 10 && 
                       !texto.includes('Go') && 
                       !texto.includes('Ir') &&
                       !texto.includes('+') &&
                       !texto.includes('coins') &&
                       !texto.includes('moedas') &&
                       !texto.includes('Coins');
              });
              
              if (textos.length > 0) {
                const nomeTarefa = textos[0].textContent.trim();
                console.log(`📝 Tarefa encontrada: "${nomeTarefa}"`);
                
                resultados.push({
                  nome: nomeTarefa,
                  elemento: 'botao_go'
                });
              }
            }
          } catch (e) {
            console.log('Erro ao processar botão Go:', e);
          }
        }
        
        // 🔥 DEBUG: MOSTRAR TODOS OS TEXTOS ENCONTRADOS NA PÁGINA
        console.log('=== DEBUG: TODOS OS TEXTOS DA PÁGINA ===');
        const todosTextos = Array.from(document.querySelectorAll('span, div, p, h3, h4, button'))
          .map(el => el.textContent?.trim())
          .filter(texto => texto && texto.length > 5);
        
        console.log('Textos encontrados:', todosTextos.slice(0, 20)); // Mostra os primeiros 20
        
        return resultados;
      } catch (e) {
        console.log('Erro no evaluate:', e);
        return [];
      }
    });
    
    console.log(`✅ Total de tarefas encontradas: ${tarefas.length}`);
    console.log(`📋 Lista de tarefas:`, tarefas.map(t => t.nome));
    return tarefas || [];
  } catch (error) {
    console.log('❌ Erro ao obter tarefas:', error.message);
    return [];
  }
}

// 🔥 CLICAR TAREFA ESPECÍFICA (COMPATÍVEL COM PORTUGUÊS E INGLÊS)
async function clicarTarefaEspecifica(page, nomeTarefa) {
  try {
    console.log(`   🔍 DEBUG: Procurando tarefa: "${nomeTarefa}"`);
    
    const sucesso = await page.evaluate((nome) => {
      try {
        // 🔥 ESTRATÉGIA: PROCURA POR BOTÕES "Go/Ir" E VERIFICA O TEXTO DA TAREFA PRÓXIMO
        const todosBotoes = Array.from(document.querySelectorAll('button'));
        const botoesGo = todosBotoes.filter(btn => {
          const texto = btn.textContent?.trim() || '';
          return ['Go', 'GO', 'Ir'].includes(texto) && btn.offsetWidth > 0;
        });
        
        console.log(`🔍 DEBUG: ${botoesGo.length} botões "Go/Ir" encontrados`);
        
        for (let btn of botoesGo) {
          const container = btn.closest('div, li, section, [class*="task"], [class*="item"]');
          if (container) {
            const textos = Array.from(container.querySelectorAll('span, div, p, h3, h4')).filter(el => {
              const texto = el.textContent?.trim() || '';
              return texto.length > 10 && 
                     !texto.includes('Go') && 
                     !texto.includes('Ir') &&
                     !texto.includes('+') &&
                     !texto.includes('coins') &&
                     !texto.includes('moedas');
            });
            
            if (textos.length > 0) {
              const textoEncontrado = textos[0].textContent.trim();
              console.log(`🔍 DEBUG: Comparando "${textoEncontrado}" com "${nome}"`);
              
              // 🔥 BUSCA POR FRAGMENTO (NÃO EXATO) - COMPATÍVEL AMBOS IDIOMAS
              const fragmentoAlvo = nome.toLowerCase().slice(0, 10);
              const fragmentoEncontrado = textoEncontrado.toLowerCase().slice(0, 10);
              
              if (textoEncontrado.toLowerCase().includes(nome.toLowerCase().slice(0, 10))) {
                console.log(`✅ DEBUG: ENCONTROU! Clicando em: ${nome}`);
                btn.click();
                return true;
              }
            }
          }
        }
        
        console.log(`❌ DEBUG: NÃO ENCONTROU a tarefa: ${nome}`);
        return false;
      } catch (e) {
        console.log('❌ DEBUG: Erro ao clicar:', e);
        return false;
      }
    }, nomeTarefa);

    return sucesso;
  } catch (error) {
    console.log(`   ❌ Erro ao clicar:`, error.message);
    return false;
  }
}

// 🔥 EXECUTAR TAREFA ESPECÍFICA (COMPATÍVEL COM PORTUGUÊS E INGLÊS)
async function executarTarefaEspecifica(page, tarefa, urlMoedas) {
  try {
    // 🔥 CLICAR NA TAREFA ESPECÍFICA
    console.log(`   🔍 Clicando em: ${tarefa.nome}`);
    const clicked = await clicarTarefaEspecifica(page, tarefa.nome);
    if (!clicked) return false;

    await delay(3000);
    await takeScreenshot(page, `clicou-tarefa-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);

    // 🔥 VERIFICAR SE MUDOU DE PÁGINA
    const urlAtual = page.url();
    
    if (urlAtual.includes('coin-index')) {
      // Tarefa instantânea (como check-in)
      console.log(`   ✅ Tarefa instantânea concluída`);
      return true;
    } else {
      // Tarefa com navegação
      console.log(`   📱 Navegou para tarefa`);
      await takeScreenshot(page, `pagina-tarefa-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
      
      // 🔥 IDENTIFICAR TIPO DE TAREFA PELO NOME (COMPATÍVEL AMBOS IDIOMAS)
      if (tarefa.nome.includes('Browse surprise items') || tarefa.nome.includes('Navegar por itens surpresa')) {
        await executarBrowseSurpriseItems(page, urlMoedas);
      } else if (tarefa.nome.includes('Find what you like') || tarefa.nome.includes('Encontrar o que você gosta')) {
        await executarPesquisa(page, urlMoedas);
      } else if (tarefa.nome.includes('View Super discounts') || 
                 tarefa.nome.includes('Explore sponsored items') ||
                 tarefa.nome.includes('Ver Super descontos') ||
                 tarefa.nome.includes('Explorar itens patrocinados') ||
                 tarefa.nome.includes('Discount hunt') ||
                 tarefa.nome.includes('Coupons and credits')) {
        // Tarefas com espera de 19 segundos
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      } else if (tarefa.nome.includes('Coins Savings Recap') || tarefa.nome.includes('Resumo de economia de moedas')) {
        // Tarefa extrato de moedas (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      } else {
        // Tarefa genérica (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
        await voltarParaMoedas(page, urlMoedas);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`   💥 Erro em ${tarefa.nome}:`, error.message);
    await takeScreenshot(page, `erro-tarefa-${tarefa.nome.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`);
    
    try {
      await voltarParaMoedas(page, urlMoedas);
    } catch (e) {}
    
    return false;
  }
}

// 🔥 EXECUTAR BROWSE SURPRISE ITEMS (MELHORADO) - COMPATÍVEL AMBOS IDIOMAS
async function executarBrowseSurpriseItems(page, urlMoedas) {
  console.log('   🎁 Executando browse surprise items (3 produtos)...');
  
  // 🔥 AGUARDAR PÁGINA CARREGAR COMPLETAMENTE
  console.log('   ⏳ Aguardando carregamento da página...');
  await delay(6000);
  await takeScreenshot(page, 'browse-items-carregado');
  
  // 🔥 CLICA EM 3 PRODUTOS DIFERENTES
  for (let i = 1; i <= 3; i++) {
    console.log(`   👆 Procurando ${i}º produto...`);
    
    const clicked = await page.evaluate((index) => {
      try {
        // Pega todos os elementos que parecem produtos
        const produtos = Array.from(document.querySelectorAll('a, div[class*="product"], div[class*="item"], [class*="card"]'));
        
        // Filtra apenas os visíveis e que estão na parte inferior da tela
        const produtosVisiveis = produtos.filter(el => {
          const rect = el.getBoundingClientRect();
          const estaVisivel = rect.width > 0 && rect.height > 0 && rect.top > 0;
          const estaNaParteInferior = rect.top > (window.innerHeight * 0.3);
          
          return estaVisivel && estaNaParteInferior;
        });
        
        console.log(`🔍 Encontrados ${produtosVisiveis.length} produtos visíveis`);
        
        // Seleciona produtos em posições diferentes (evita cliques repetidos)
        const produtoIndex = Math.min((index - 1) * 3, produtosVisiveis.length - 1);
        
        if (produtosVisiveis[produtoIndex]) {
          console.log(`🎯 Clicando no produto ${produtoIndex + 1}`);
          produtosVisiveis[produtoIndex].click();
          return true;
        } else {
          console.log(`❌ Não encontrou produto na posição ${produtoIndex}`);
          return false;
        }
      } catch (e) {
        console.log('Erro ao clicar no produto:', e);
        return false;
      }
    }, i);

    if (clicked) {
      console.log(`   ✅ Produto ${i} clicado!`);
      await delay(4000);
      await takeScreenshot(page, `produto-${i}-clicado`);
      
      // Volta para a lista de produtos
      console.log('   ↩️ Voltando para lista de produtos...');
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
      await delay(3000);
      await takeScreenshot(page, `volta-produto-${i}`);
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

// 🔥 EXECUTAR PESQUISA - COMPATÍVEL AMBOS IDIOMAS
async function executarPesquisa(page, urlMoedas) {
  console.log('   🔍 Executando pesquisa...');
  await delay(5000);
  await takeScreenshot(page, 'pagina-pesquisa');
  
  const digitou = await page.evaluate(() => {
    try {
      const campos = Array.from(document.querySelectorAll('input[type="text"], input[type="search"]'));
      for (let campo of campos) {
        if (campo.offsetWidth > 0) {
          campo.focus();
          campo.value = 'pendrive';
          campo.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  if (digitou) {
    console.log('   ⌨️ Digitou "pendrive"');
    await takeScreenshot(page, 'digitou-pesquisa');
    await delay(2000);
    await page.keyboard.press('Enter');
    console.log('   🔍 Pesquisando...');
    await delay(8000);
    await takeScreenshot(page, 'resultado-pesquisa');
  }
  
  await voltarParaMoedas(page, urlMoedas);
}

// 🔥 VOLTAR PARA PÁGINA DE MOEDAS
async function voltarParaMoedas(page, urlMoedas) {
  try {
    console.log('   ↩️ Voltando para moedas...');
    
    try {
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
      await delay(3000);
      
      const url = page.url();
      if (url.includes('coin-index')) {
        console.log('   ✅ Voltou com sucesso');
        await takeScreenshot(page, 'volta-moedas-sucesso');
        return true;
      }
    } catch (e) {}
    
    await page.goto(urlMoedas, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await delay(3000);
    await takeScreenshot(page, 'navegou-moedas');
    
    console.log('   ✅ Página de moedas carregada');
    return true;
  } catch (error) {
    console.log('   ❌ Erro ao voltar para moedas:', error.message);
    await takeScreenshot(page, 'erro-voltar-moedas');
    return false;
  }
}

// 🔥 COLETAR MOEDAS DIÁRIAS (COMPATÍVEL AMBOS IDIOMAS)
async function coletarMoedasDiarias(page) {
  try {
    console.log('💰 Verificando moedas para coletar...');
    
    const coletou = await page.evaluate(() => {
      const botoes = Array.from(document.querySelectorAll('button, div, span'));
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
        // 🔥 ACEITA "coletar" E "collect"
        if (texto.includes('coletar') || texto.includes('collect')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (coletou) {
      console.log('✅ Moedas coletadas!');
      await delay(3000);
    }
  } catch (error) {
    console.log('❌ Erro ao coletar moedas:', error.message);
  }
}

// 🔥 ABRIR MODAL DE TAREFAS
async function abrirModalTarefas(page) {
  try {
    console.log('📋 Abrindo modal de tarefas...');
    
    const abriu = await page.evaluate(() => {
      const botoes = Array.from(document.querySelectorAll('button, div, span'));
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
        // 🔥 ACEITA "tarefas", "tasks", "fazer tarefas", "do tasks"
        if (texto.includes('tarefa') || texto.includes('task') || texto.includes('fazer tarefa') || texto.includes('do task')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (abriu) {
      console.log('✅ Modal aberto!');
      await delay(3000);
      return true;
    } else {
      console.log('❌ Não encontrou botão do modal');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao abrir modal:', error.message);
    return false;
  }
}

// 🔥 REMOVER POPUP SALVAR SENHA (AGRESSIVO)
async function removerPopupSalvarSenhaAgressivo(page) {
  try {
    await page.evaluate(() => {
      const elementos = Array.from(document.querySelectorAll('*'));
      
      for (let el of elementos) {
        const texto = el.textContent?.toLowerCase() || '';
        if (texto.includes('save') || texto.includes('salvar') || texto.includes('password') || texto.includes('senha')) {
          const btnFechar = el.closest('div, dialog, section')?.querySelector('button, [role="button"], [class*="close"], [class*="cancel"]');
          if (btnFechar) {
            btnFechar.click();
            return;
          }
        }
      }
    });
  } catch (error) {
    // Ignora erros
  }
}

// 🔥 EXECUTAR BROWSE SURPRISE ITEMS FINAL (APÓS TEMPO LIMITE)
async function executarBrowseSurpriseItemsFinal(page, urlMoedas) {
  console.log('\n🎁 EXECUÇÃO FINAL: Browse Surprise Items (3 produtos)...');
  
  try {
    // Abrir modal de tarefas
    await abrirModalTarefas(page);
    await delay(3000);
    
    // Clicar em "Browse surprise items"
    const clicked = await clicarTarefaEspecifica(page, 'Browse surprise items');
    if (!clicked) {
      // Tenta em português
      await clicarTarefaEspecifica(page, 'Navegar por itens surpresa');
    }
    
    await delay(3000);
    
    // Executar a tarefa
    await executarBrowseSurpriseItems(page, urlMoedas);
    
    console.log('✅ EXECUÇÃO FINAL CONCLUÍDA!');
  } catch (error) {
    console.log('❌ Erro na execução final:', error.message);
  }
}

// 🔥 EXECUTAR BOT
botEventosReais().catch(console.error);
