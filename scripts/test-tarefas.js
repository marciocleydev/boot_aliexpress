// test-tarefas.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT COMPLETO - GitHub Actions Version');

async function botUltimate() {
  // Obter credenciais das variáveis de ambiente
  const email = process.env.ALIEXPRESS_EMAIL;
  const password = process.env.ALIEXPRESS_PASSWORD;
  
  if (!email || !password) {
    console.error('❌ Credenciais não encontradas nas variáveis de ambiente');
    process.exit(1);
  }

  console.log('📧 Email:', email);
  console.log('🔑 Senha:', '***' + password.slice(-4));

  // Configuração para GitHub Actions
  const userAgent = new UserAgent({ deviceCategory: 'mobile' });
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=390,844',
      '--disable-blink-features=AutomationControlled',
      '--disable-notifications',
      '--user-agent=' + userAgent.toString()
    ]
  });

  const page = await browser.newPage();
  
  // 🔥 URL DA PÁGINA DE MOEDAS
  const URL_MOEDAS = 'https://m.aliexpress.com/p/coin-index/index.html?utm=botdoafiliado&_immersiveMode=true&from=syicon&t=botmoedas&tt=CPS_NORMAL&_mobile=1&_is_mobile=1';

  // 🔥 SISTEMA INTELIGENTE
  const tarefasConcluidas = new Set();
  const contadorTarefas = new Map();
  const tarefasMultiplas = new Set(['Veja os super descontos', 'Descubra itens patrocinados']);

  try {
    // 🔥 CONFIGURAÇÃO STEALTH
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

    // === LOGIN ===
    console.log('1. 🔐 Login...');
    await page.goto('https://login.aliexpress.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await delay(4000);

    const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    if (emailInput) {
      await emailInput.type(email, { delay: 100 });
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
    if (continueBtn.asElement()) await continueBtn.asElement().click();

    await delay(5000);

    const senhaInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    if (senhaInput) {
      await senhaInput.type(password, { delay: 80 });
    }

    await delay(2000);

    const signInBtn = await page.evaluateHandle(() => {
      const botoes = Array.from(document.querySelectorAll('button'));
      return botoes.find(btn => {
        const texto = btn.textContent?.toLowerCase() || '';
        return texto.includes('sign in') || texto.includes('login') || texto.includes('entrar');
      });
    });
    if (signInBtn.asElement()) await signInBtn.asElement().click();

    console.log('⏳ Aguardando login... 15 segundos');
    await delay(15000);

    // Verificar se login foi bem sucedido
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('❌ Login falhou! Verifique as credenciais.');
      await saveScreenshot(page, 'login-failed');
      await browser.close();
      return;
    }

    console.log('✅ Login realizado com sucesso!');

    // Navegar para moedas
    console.log('2. 🪙 Indo para moedas...');
    await page.goto(URL_MOEDAS, {
      waitUntil: 'networkidle2',
      timeout: 20000
    });

    // Salvar screenshot
    await saveScreenshot(page, 'pagina-moedas');

    // Remover popup de senha
    console.log('🗑️ Removendo popup de senha...');
    await delay(10000);
    await removerPopupSalvarSenhaAgressivo(page);
    await delay(3000);

    // === ESTRATÉGIA COM TEMPO LIMITE ===
    console.log('3. 🔥 Iniciando execução com tempo limite de 2.0 minutos...\n');
    
    // 🔥 COLETAR MOEDAS DIÁRIAS
    await coletarMoedasDiarias(page);
    
    // 🔥 TEMPO LIMITE DE 2.0 MINUTOS
    const tempoLimite = 2.0 * 60 * 1000;
    const inicio = Date.now();
    
    let rodada = 0;
    
    while (Date.now() - inicio < tempoLimite) {
      rodada++;
      console.log(`\n🔄 Rodada ${rodada} - Tempo restante: ${Math.round((tempoLimite - (Date.now() - inicio)) / 1000)}s`);
      
      // 🔥 ABRIR MODAL DE TAREFAS
      const modalAberto = await abrirModalTarefas(page);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal, tentando novamente...');
        await delay(5000);
        continue;
      }
      
      // 🔥 OBTER TAREFAS DISPONÍVEIS
      let tarefasDisponiveis = [];
      try {
        tarefasDisponiveis = await obterTarefasDisponiveis(page);
      } catch (error) {
        console.log('❌ Erro ao obter tarefas:', error.message);
        await delay(5000);
        continue;
      }
      
      if (!Array.isArray(tarefasDisponiveis) || tarefasDisponiveis.length === 0) {
        console.log('ℹ️ Nenhuma tarefa disponível no momento');
        await delay(5000);
        continue;
      }
      
      // 🔥 FILTRAR TAREFAS - REMOVER JOGOS
      const tarefasFiltradas = tarefasDisponiveis.filter(tarefa => {
        if (!tarefa || !tarefa.nome) return false;
        
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
        await delay(5000);
        continue;
      }
      
      console.log(`📋 Tarefas disponíveis: ${tarefasFiltradas.length}`);
      
      // 🔥 EXECUTAR CADA TAREFA FILTRADA
      let tarefasExecutadas = 0;
      
      for (const tarefa of tarefasFiltradas) {
        if (Date.now() - inicio >= tempoLimite) {
          console.log('⏰ Tempo limite de 2.0 minutos atingido!');
          break;
        }
        
        console.log(`\n🎯 EXECUTANDO: ${tarefa.nome}`);
        
        const execucoes = contadorTarefas.get(tarefa.nome) || 0;
        contadorTarefas.set(tarefa.nome, execucoes + 1);
        
        if (tarefasConcluidas.has(tarefa.nome)) {
          console.log(`✅ ${tarefa.nome} - JÁ CONCLUÍDA (ignorando)`);
          continue;
        }
        
        const success = await executarTarefaEspecifica(page, tarefa, URL_MOEDAS);
        
        if (success) {
          console.log(`✅ ${tarefa.nome} - EXECUTADA COM SUCESSO (${execucoes + 1} execuções)`);
          tarefasExecutadas++;
          
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
      
      await delay(3000);
    }

    console.log('\n⏰ TEMPO LIMITE DE 2.0 MINUTOS ATINGIDO!');
    console.log('🎉 PROCESSO PRINCIPAL CONCLUÍDO!');
    console.log('📊 Estatísticas finais:');
    console.log('   - Tarefas completamente concluídas:', Array.from(tarefasConcluidas));
    console.log('   - Contador de execuções por tarefa:', Object.fromEntries(contadorTarefas));

    // 🔥 EXECUÇÃO ESPECIAL PARA "EXPLORE ITENS SURPRESA"
    await executarExploreItensSurpresaFinal(page, URL_MOEDAS);

    console.log('\n🏁 TODAS AS TAREFAS FINALIZADAS!');
    
    // Salvar screenshot final
    await saveScreenshot(page, 'resultado-final');

  } catch (error) {
    console.error('💥 Erro crítico:', error);
    await saveScreenshot(page, 'erro-critico');
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Navegador fechado.');
  }
}

// 🔥 FUNÇÕES AUXILIARES (as mesmas do seu código)

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

async function executarTarefaEspecifica(page, tarefa, urlMoedas) {
  try {
    console.log(`   🔍 Clicando em: ${tarefa.nome}`);
    const clicked = await clicarTarefaEspecifica(page, tarefa.nome);
    if (!clicked) return false;

    await delay(3000);

    const urlAtual = page.url();
    
    if (urlAtual.includes('coin-index')) {
      console.log(`   ✅ Tarefa instantânea concluída`);
      return true;
    } else {
      console.log(`   📱 Navegou para tarefa`);
      
      if (tarefa.nome.includes('Explore itens surpresa')) {
        await executarExploreItensSurpresa(page, urlMoedas);
      } else if (tarefa.nome.includes('Procure o que você gosta')) {
        await executarPesquisa(page, urlMoedas);
      } else if (tarefa.nome.includes('Veja os super descontos') || 
                 tarefa.nome.includes('Descubra itens patrocinados') ||
                 tarefa.nome.includes('Caça-descontos') ||
                 tarefa.nome.includes('Cupons e créditos')) {
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await voltarParaMoedas(page, urlMoedas);
      } else if (tarefa.nome.includes('Veja seu "Extrato de Moedas"')) {
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await voltarParaMoedas(page, urlMoedas);
      } else {
        console.log('   ⏳ Aguardando 15s...');
        await delay(15000);
        await voltarParaMoedas(page, urlMoedas);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`   💥 Erro em ${tarefa.nome}:`, error.message);
    
    try {
      await voltarParaMoedas(page, urlMoedas);
    } catch (e) {}
    
    return false;
  }
}

async function executarExploreItensSurpresa(page, urlMoedas) {
  console.log('   🎁 Executando itens surpresa (3 produtos)...');
  await delay(6000);
  
  for (let i = 1; i <= 3; i++) {
    console.log(`   👆 Procurando ${i}º produto...`);
    
    const clicked = await page.evaluate((index) => {
      try {
        const produtos = Array.from(document.querySelectorAll('a, div[class*="product"], div[class*="item"], [class*="card"]'));
        const produtosVisiveis = produtos.filter(el => {
          const rect = el.getBoundingClientRect();
          const estaVisivel = rect.width > 0 && rect.height > 0 && rect.top > 0;
          const estaNaParteInferior = rect.top > (window.innerHeight * 0.3);
          return estaVisivel && estaNaParteInferior;
        });
        
        console.log(`🔍 Encontrados ${produtosVisiveis.length} produtos visíveis`);
        const produtoIndex = Math.min((index - 1) * 3, produtosVisiveis.length - 1);
        
        if (produtosVisiveis[produtoIndex]) {
          console.log(`🎯 Clicando no produto ${produtoIndex + 1}`);
          produtosVisiveis[produtoIndex].click();
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }, i);

    if (clicked) {
      console.log(`   ✅ Produto ${i} clicado`);
      await delay(4000);
      console.log('   ↩️ Voltando para lista de produtos...');
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
      await delay(3000);
    } else {
      console.log(`   ❌ Produto ${i} não encontrado, tentando próximo...`);
      await page.evaluate(() => { window.scrollBy(0, 300); });
      await delay(2000);
    }
  }
  
  console.log('   🔄 Voltando para moedas...');
  await voltarParaMoedas(page, urlMoedas);
}

async function executarPesquisa(page, urlMoedas) {
  console.log('   🔍 Executando pesquisa...');
  await delay(5000);
  
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
    await delay(2000);
    await page.keyboard.press('Enter');
    console.log('   🔍 Pesquisando...');
    await delay(8000);
  }
  
  await voltarParaMoedas(page, urlMoedas);
}

async function voltarParaMoedas(page, urlMoedas) {
  try {
    console.log('   ↩️ Voltando para moedas...');
    
    try {
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
      await delay(3000);
      
      const url = page.url();
      if (url.includes('coin-index')) {
        console.log('   ✅ Voltou com sucesso');
        return true;
      }
    } catch (e) {}
    
    await page.goto(urlMoedas, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await delay(3000);
    
    console.log('   ✅ Página de moedas carregada');
    return true;
  } catch (error) {
    console.log('   ❌ Erro ao voltar para moedas:', error.message);
    return false;
  }
}

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

async function abrirModalTarefas(page) {
  try {
    const modalAberto = await verificarModalAberto(page);
    if (modalAberto) return true;
    
    await page.click('#signButton');
    await delay(5000);
    
    const abriu = await verificarModalAberto(page);
    return abriu;
  } catch (error) {
    console.log('❌ Erro ao abrir modal:', error.message);
    return false;
  }
}

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
        const elementosFechar = Array.from(document.querySelectorAll('div, button, span'));
        const xButtons = elementosFechar.filter(el => {
          const texto = el.textContent?.trim() || '';
          const html = el.innerHTML?.toLowerCase() || '';
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
    }
  } catch (error) {
    console.log('ℹ️ Erro ao tentar fechar popup:', error.message);
  }
}

// 🔥 FUNÇÃO EXCLUSIVA PARA EXPLORE ITENS SURPRESA
async function executarExploreItensSurpresaFinal(page, urlMoedas) {
  console.log('\n🎯 INICIANDO EXECUÇÃO ESPECIAL PARA "EXPLORE ITENS SURPRESA"');
  
  try {
    const paginaPrincipal = page;
    
    for (let execucao = 1; execucao <= 2; execucao++) {
      console.log(`\n🔁 Execução ${execucao}/2 da tarefa especial...`);
      
      console.log('1. 📱 Abrindo modal de tarefas...');
      const modalAberto = await abrirModalTarefas(paginaPrincipal);
      if (!modalAberto) continue;
      await delay(3000);
      
      console.log('2. 🔍 Clicando em "Explore itens surpresa"...');
      const tarefaEncontrada = await clicarTarefaEspecifica(paginaPrincipal, 'Explore itens surpresa');
      if (!tarefaEncontrada) continue;
      
      console.log('3. 🚀 Aguardando nova aba abrir...');
      await delay(6000);
      
      const browser = paginaPrincipal.browser();
      const pages = await browser.pages();
      if (pages.length <= 1) continue;
      
      const novaAba = pages[pages.length - 1];
      console.log('   ✅ Mudando para nova aba de produtos...');
      await novaAba.bringToFront();
      await delay(4000);
      
      const estaNaPaginaProdutos = await novaAba.evaluate(() => {
        return document.querySelector('.product-click') !== null;
      });
      
      if (!estaNaPaginaProdutos) {
        await novaAba.close();
        await paginaPrincipal.bringToFront();
        continue;
      }
      
      console.log('4. 🎯 Clicando em 3 produtos...');
      const produtosClicados = new Set();
      
      for (let i = 1; i <= 3; i++) {
        console.log(`   📦 Procurando produto ${i}/3...`);
        
        const resultado = await novaAba.evaluate((clicados, indice) => {
          try {
            const productClicks = Array.from(document.querySelectorAll('.product-click'));
            console.log(`🔍 Encontrados ${productClicks.length} elementos .product-click`);
            const clicksVisiveis = productClicks.filter(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });
            
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
          produtosClicados.add(i);
          console.log(`   ✅ Produto ${i}/3 clicado!`);
          console.log('   ⏳ Aguardando 8s...');
          await delay(8000);
          
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
          
          if (i < 3) {
            await novaAba.evaluate(() => { window.scrollBy(0, 400); });
            await delay(2000);
          }
        } else {
          console.log(`   ❌ Produto ${i} não encontrado`);
          break;
        }
      }
      
      console.log(`🎉 Execução ${execucao}/2 concluída! ${produtosClicados.size} produtos clicados.`);
      console.log('   🗑️ Fechando aba de produtos...');
      await novaAba.close();
      await paginaPrincipal.bringToFront();
      await delay(3000);
      
      if (execucao < 2) {
        console.log('🔄 Pronto para próxima execução...');
        await delay(3000);
      }
    }
    
    console.log('🎉 EXECUÇÃO ESPECIAL "EXPLORE ITENS SURPRESA" CONCLUÍDA!');
    
  } catch (error) {
    console.log('💥 Erro na execução especial:', error.message);
    try {
      const browser = page.browser();
      const pages = await browser.pages();
      for (let i = pages.length - 1; i > 0; i--) {
        await pages[i].close();
      }
      await pages[0].bringToFront();
    } catch (e) {}
  }
}

// Função para salvar screenshots
async function saveScreenshot(page, nome) {
  try {
    const screenshotDir = './screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `${nome}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);
  } catch (error) {
    console.log('❌ Erro ao salvar screenshot:', error.message);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  botUltimate().catch(error => {
    console.error('❌ Erro na execução do bot:', error);
    process.exit(1);
  });
}

module.exports = botUltimate;
