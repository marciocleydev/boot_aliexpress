// scripts/test-tarefas.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT - Versão GitHub Actions (Português)');

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
      fullPage: true,
      type: 'png',
      quality: 80
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
    headless: isCI ? true : false,
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
      // 🔥 FORÇAR PORTUGUÊS
      '--lang=pt-BR',
      '--accept-lang=pt-BR,pt,en',
      '--timezone=America/Sao_Paulo',
      // Otimizações CI
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--user-agent=' + userAgent.toString()
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  // 🔥 CONFIGURAÇÃO DE IDIOMA
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'pt-BR' });
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en'] });
    Object.defineProperty(navigator, 'userLanguage', { get: () => 'pt-BR' });
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // 🔥 INTERCEPTA ABERTURA DE NOVAS ABAS
  await page.evaluateOnNewDocument(() => {
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
  
  console.log('📱 Ambiente configurado!');

  const URL_MOEDAS = 'https://m.aliexpress.com/p/coin-index/index.html?utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL&_mobile=1&_is_mobile=1';
  const tarefasConcluidas = new Set();
  const contadorTarefas = new Map();
  const tarefasMultiplas = new Set(['Veja os super descontos', 'Descubra itens patrocinados']);

  try {
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

    // Botão Continuar
    console.log('3. 🔘 Clicando em Continuar...');
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

    // Senha
    console.log('4. 🔑 Inserindo senha...');
    const senhaInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    if (senhaInput) {
      await senhaInput.type(ALIEXPRESS_PASSWORD, { delay: 80 });
      await takeScreenshot(page, 'senha-inserida');
    }

    await delay(2000);

    // Botão Login
    console.log('5. 🔘 Clicando em Login...');
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

    // Remover popup de senha
    console.log('🗑️ Removendo popup de senha...');
    await delay(10000);
    await removerPopupSalvarSenhaAgressivo(page);
    await takeScreenshot(page, 'apos-remover-popup');
    await delay(3000);

    // === ESTRATÉGIA COM TEMPO LIMITE ===
    console.log('7. 🔥 Iniciando execução com tempo limite de 2.5 minutos...\n');
    
    // 🔥 COLETAR MOEDAS DIÁRIAS SE DISPONÍVEL
    await coletarMoedasDiarias(page);
    await takeScreenshot(page, 'apos-coletar-moedas');
    
    // 🔥 TEMPO LIMITE DE 2.5 MINUTOS (150 segundos)
    const tempoLimite = 2.5 * 60 * 1000;
    const inicio = Date.now();
    
    // 🔥 EXECUTAR LOOP POR ATÉ 2.5 MINUTOS
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
      
      // 🔥 OBTER TAREFAS DISPONÍVEIS (EXCLUINDO JOGOS)
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
      
      // 🔥 FILTRAR TAREFAS - REMOVER JOGOS
      const tarefasFiltradas = tarefasDisponiveis.filter(tarefa => {
        if (!tarefa || !tarefa.nome) return false;
        
        // 🔥 EXCLUIR TAREFAS DE JOGO
        if (tarefa.nome.includes('Tente sua sorte') || 
            tarefa.nome.includes('Merge Boss') ||
            tarefa.nome.includes('jogo')) {
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
          console.log('⏰ Tempo limite de 2.5 minutos atingido!');
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
          if (tarefa.nome.includes('Explore itens surpresa')) {
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

    console.log('\n⏰ TEMPO LIMITE DE 2.5 MINUTOS ATINGIDO!');
    console.log('🎉 PROCESSO PRINCIPAL CONCLUÍDO!');
    console.log('📊 Estatísticas finais:');
    console.log('   - Tarefas completamente concluídas:', Array.from(tarefasConcluidas));
    console.log('   - Contador de execuções por tarefa:', Object.fromEntries(contadorTarefas));

    // 🔥 EXECUÇÃO ESPECIAL PARA "EXPLORE ITENS SURPRESA"
    await executarExploreItensSurpresaFinal(page, URL_MOEDAS);

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

// 🔥 OBTER TAREFAS DISPONÍVEIS
async function obterTarefasDisponiveis(page) {
  try {
    const tarefas = await page.evaluate(() => {
      try {
        const resultados = [];
        const tarefasElementos = document.querySelectorAll('.e2e_normal_task');
        
        for (let tarefa of tarefasElementos) {
          try {
            const tituloElement = tarefa.querySelector('.e2e_normal_task_content_title');
            const botaoElement = tarefa.querySelector('.e2e_normal_task_right_btn');
            
            if (tituloElement && botaoElement) {
              const nome = tituloElement.textContent.trim();
              const botaoVisivel = botaoElement.offsetWidth > 0 && botaoElement.offsetHeight > 0;
              const botaoHabilitado = botaoElement.style.display !== 'none';
              
              const textoBotao = botaoElement.textContent.trim();
              const botaoDisponivel = textoBotao === 'Ir' || textoBotao === 'Go';
              
              if (botaoVisivel && botaoHabilitado && botaoDisponivel) {
                resultados.push({
                  nome: nome,
                  elemento: 'botao_ir'
                });
              }
            }
          } catch (e) {
            console.log('Erro ao processar tarefa individual:', e);
          }
        }
        
        return resultados;
      } catch (e) {
        console.log('Erro no evaluate:', e);
        return [];
      }
    });
    
    return tarefas || [];
  } catch (error) {
    console.log('❌ Erro ao obter tarefas:', error.message);
    return [];
  }
}

// 🔥 EXECUTAR TAREFA ESPECÍFICA
async function executarTarefaEspecifica(page, tarefa, urlMoedas) {
  try {
    // 🔥 CLICAR NA TAREFA ESPECÍFICA
    console.log(`   🔍 Clicando em: ${tarefa.nome}`);
    const clicked = await clicarTarefaEspecifica(page, tarefa.nome);
    if (!clicked) return false;

    await delay(3000);
    await takeScreenshot(page, `clicou-tarefa-${tarefa.nome.substring(0, 10)}`);

    // 🔥 VERIFICAR SE MUDOU DE PÁGINA
    const urlAtual = page.url();
    
    if (urlAtual.includes('coin-index')) {
      // Tarefa instantânea (como check-in)
      console.log(`   ✅ Tarefa instantânea concluída`);
      return true;
    } else {
      // Tarefa com navegação
      console.log(`   📱 Navegou para tarefa`);
      await takeScreenshot(page, `pagina-tarefa-${tarefa.nome.substring(0, 10)}`);
      
      // 🔥 IDENTIFICAR TIPO DE TAREFA PELO NOME
      if (tarefa.nome.includes('Explore itens surpresa')) {
        await executarExploreItensSurpresa(page, urlMoedas);
      } else if (tarefa.nome.includes('Procure o que você gosta')) {
        await executarPesquisa(page, urlMoedas);
      } else if (tarefa.nome.includes('Veja os super descontos') || 
                 tarefa.nome.includes('Descubra itens patrocinados') ||
                 tarefa.nome.includes('Caça-descontos') ||
                 tarefa.nome.includes('Cupons e créditos')) {
        // Tarefas com espera de 19 segundos
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10)}`);
        await voltarParaMoedas(page, urlMoedas);
      } else if (tarefa.nome.includes('Veja seu "Extrato de Moedas"')) {
        // Tarefa extrato de moedas (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10)}`);
        await voltarParaMoedas(page, urlMoedas);
      } else {
        // Tarefa genérica (15 segundos)
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await takeScreenshot(page, `antes-voltar-${tarefa.nome.substring(0, 10)}`);
        await voltarParaMoedas(page, urlMoedas);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`   💥 Erro em ${tarefa.nome}:`, error.message);
    await takeScreenshot(page, `erro-tarefa-${tarefa.nome.substring(0, 10)}`);
    
    try {
      await voltarParaMoedas(page, urlMoedas);
    } catch (e) {}
    
    return false;
  }
}

// 🔥 EXECUTAR EXPLORE ITENS SURPRESA (MELHORADO)
async function executarExploreItensSurpresa(page, urlMoedas) {
  console.log('   🎁 Executando itens surpresa (3 produtos)...');
  
  // 🔥 AGUARDAR PÁGINA CARREGAR COMPLETAMENTE
  console.log('   ⏳ Aguardando carregamento da página...');
  await delay(6000);
  await takeScreenshot(page, 'explore-itens-carregado');
  
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
      console.log(`   ✅ Produto ${i} clicado`);
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

// 🔥 EXECUTAR PESQUISA
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

// 🔥 CLICAR TAREFA ESPECÍFICA
async function clicarTarefaEspecifica(page, nomeTarefa) {
  try {
    const sucesso = await page.evaluate((nome) => {
      try {
        const tarefas = document.querySelectorAll('.e2e_normal_task');
        
        for (let tarefa of tarefas) {
          const titulo = tarefa.querySelector('.e2e_normal_task_content_title');
          if (titulo && titulo.textContent.trim() === nome) {
            const botaoIr = tarefa.querySelector('.e2e_normal_task_right_btn');
            if (botaoIr && botaoIr.offsetWidth > 0) {
              botaoIr.click();
              return true;
            }
          }
        }
        return false;
      } catch (e) {
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
    console.log('💰 Verificando moedas para coletar...');
    
    const coletou = await page.evaluate(() => {
      const botoes = Array.from(document.querySelectorAll('button, div, span'));
      
      for (let btn of botoes) {
        const texto = btn.textContent?.toLowerCase() || '';
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
    
    await page.click('#signButton');
    await delay(5000);
    
    const abriu = await verificarModalAberto(page);
    return abriu;
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
        const modal = document.querySelector('.aecoin-main-bottom-2_eZO');
        return modal && modal.offsetWidth > 0 && modal.offsetHeight > 0;
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
                 html.includes('fechar') || el.className.includes('close') ||
                 el.getAttribute('aria-label')?.toLowerCase().includes('close');
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
        const textosParaClicar = ['never', 'nunca', 'not now', 'agora não', 'cancelar', 'cancel', 'later', 'depois'];
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

// 🔥 FUNÇÃO EXCLUSIVA PARA EXPLORE ITENS SURPRESA - AJUSTE FINAL
async function executarExploreItensSurpresaFinal(page, urlMoedas) {
  console.log('\n🎯 INICIANDO EXECUÇÃO ESPECIAL PARA "EXPLORE ITENS SURPRESA"');
  
  try {
    const paginaPrincipal = page;
    
    for (let execucao = 1; execucao <= 2; execucao++) {
      console.log(`\n🔁 Execução ${execucao}/2 da tarefa especial...`);
      
      // 🔥 ABRIR MODAL NA ABA PRINCIPAL
      console.log('1. 📱 Abrindo modal de tarefas...');
      const modalAberto = await abrirModalTarefas(paginaPrincipal);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal');
        continue;
      }
      await delay(3000);
      await takeScreenshot(paginaPrincipal, `modal-aberto-especial-${execucao}`);
      
      // 🔥 CLICAR EM "EXPLORE ITENS SURPRESA" NA ABA PRINCIPAL
      console.log('2. 🔍 Clicando em "Explore itens surpresa"...');
      const tarefaEncontrada = await clicarTarefaEspecifica(paginaPrincipal, 'Explore itens surpresa');
      
      if (!tarefaEncontrada) {
        console.log('❌ Tarefa "Explore itens surpresa" não encontrada');
        continue;
      }
      
      console.log('3. 🚀 Aguardando nova aba abrir...');
      await delay(6000);
      await takeScreenshot(paginaPrincipal, 'antes-nova-aba');
      
      // 🔥 MUDA PARA A NOVA ABA
      const browser = paginaPrincipal.browser();
      const pages = await browser.pages();
      
      if (pages.length <= 1) {
        console.log('❌ Nenhuma nova aba foi aberta');
        continue;
      }
      
      const novaAba = pages[pages.length - 1];
      console.log('   ✅ Mudando para nova aba de produtos...');
      await novaAba.bringToFront();
      
      // 🔥 AGORA TRABALHA NA NOVA ABA
      await delay(4000);
      await takeScreenshot(novaAba, `nova-aba-produtos-${execucao}`);
      
      // 🔥 VERIFICA SE ESTÁ NA PÁGINA CORRETA
      const estaNaPaginaProdutos = await novaAba.evaluate(() => {
        return document.querySelector('.product-click') !== null;
      });
      
      if (!estaNaPaginaProdutos) {
        console.log('❌ Não está na página de produtos');
        await takeScreenshot(novaAba, 'nao-e-pagina-produtos');
        await novaAba.close();
        await paginaPrincipal.bringToFront();
        continue;
      }
      
      console.log('4. 🎯 Clicando em 3 produtos...');
      
      const produtosClicados = new Set();
      
      for (let i = 1; i <= 3; i++) {
        console.log(`   📦 Procurando produto ${i}/3...`);
        
        let produtoEncontrado = false;
        
        // 🔥 CLICA NO PRODUTO NA NOVA ABA
        const resultado = await novaAba.evaluate((clicados, indice) => {
          try {
            const productClicks = Array.from(document.querySelectorAll('.product-click'));
            console.log(`🔍 Encontrados ${productClicks.length} elementos .product-click`);
            
            // Filtra produtos visíveis
            const clicksVisiveis = productClicks.filter(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });
            
            // Seleciona produto por índice (evita repetição)
            if (clicksVisiveis.length > indice - 1) {
              const produto = clicksVisiveis[indice - 1];
              produto.scrollIntoView({ behavior: 'smooth', block: 'center' });
              produto.click();
              return { success: true };
            }
            
            return { success: false };
          } catch (e) {
            return { success: false, error: e.message };
          }
        }, Array.from(produtosClicados), i);
        
        if (resultado.success) {
          produtoEncontrado = true;
          produtosClicados.add(i);
          console.log(`   ✅ Produto ${i}/3 clicado!`);
          
          // 🔥 AGUARDA NA NOVA ABA
          console.log('   ⏳ Aguardando 8s...');
          await delay(8000);
          await takeScreenshot(novaAba, `produto-${i}-detalhes-${execucao}`);
          
          // 🔥 VOLTA PARA LISTA USANDO BOTÃO NATIVO NA NOVA ABA
          console.log('   ↩️ Voltando com botão nativo...');
          const voltou = await novaAba.evaluate(() => {
            try {
              const backBtn = document.querySelector('.ae_back_btn, .e2e_back_button, [class*="back"]');
              if (backBtn && backBtn.offsetWidth > 0) {
                backBtn.click();
                return true;
              }
              return false;
            } catch (e) {
              return false;
            }
          });
          
          if (!voltou) {
            console.log('   ⚠️ Usando goBack...');
            await novaAba.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
          }
          
          await delay(4000);
          await takeScreenshot(novaAba, `volta-lista-${i}-${execucao}`);
          
          // 🔥 FAZ SCROLL NA NOVA ABA
          if (i < 3) {
            await novaAba.evaluate(() => {
              window.scrollBy(0, 400);
            });
            await delay(2000);
          }
          
        } else {
          console.log(`   ❌ Produto ${i} não encontrado`);
          break;
        }
      }
      
      console.log(`🎉 Execução ${execucao}/2 concluída! ${produtosClicados.size} produtos clicados.`);
      
      // 🔥 FECHA A NOVA ABA E VOLTA PARA PRINCIPAL
      console.log('   🗑️ Fechando aba de produtos...');
      await novaAba.close();
      await paginaPrincipal.bringToFront();
      await delay(3000);
      await takeScreenshot(paginaPrincipal, `apos-fechar-aba-${execucao}`);
      
      if (execucao < 2) {
        console.log('🔄 Pronto para próxima execução...');
        await delay(3000);
      }
    }
    
    console.log('🎉 EXECUÇÃO ESPECIAL "EXPLORE ITENS SURPRESA" CONCLUÍDA!');
    
  } catch (error) {
    console.log('💥 Erro na execução especial:', error.message);
    await takeScreenshot(page, 'erro-execucao-especial');
    
    // Limpeza
    try {
      const browser = page.browser();
      const pages = await browser.pages();
      // Fecha todas as abas exceto a principal
      for (let i = pages.length - 1; i > 0; i--) {
        await pages[i].close();
      }
      await pages[0].bringToFront();
    } catch (e) {}
  }
}

// Executar o bot
if (require.main === module) {
  botEventosReais().catch(console.error);
}
