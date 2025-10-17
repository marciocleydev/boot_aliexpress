// bot-ali-bilingue.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🚀 BOT COMPLETO - Versão Bilíngue GitHub Actions');

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

  // 🔥 USER AGENT FIXO PARA IPHONE
  const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
  
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
      '--user-agent=' + userAgent,
      '--lang=en-US',
      '--accept-lang=en-US,en'
    ]
  });

  const page = await browser.newPage();
  
  // 🔥 LIMPAR COOKIES PARA EVITAR CACHE DE IDIOMA
  console.log('🧹 Limpando cookies...');
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');
  
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

    await page.setUserAgent(userAgent);
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    console.log('📱 Ambiente configurado! (GitHub Actions - Bilíngue)');

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
      
      // 🔥 ABRIR MODAL DE TAREFAS (MELHORADO)
      const modalAberto = await abrirModalTarefasMelhorado(page);
      if (!modalAberto) {
        console.log('❌ Não conseguiu abrir modal, tentando novamente...');
        await delay(5000);
        continue;
      }
      
      // 🔥 OBTER TAREFAS DISPONÍVEIS (BILÍNGUE)
      let tarefasDisponiveis = [];
      try {
        tarefasDisponiveis = await obterTarefasDisponiveisBilingue(page);
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
      
      // 🔥 FILTRAR TAREFAS - REMOVER JOGOS (BILÍNGUE)
      const tarefasFiltradas = tarefasDisponiveis.filter(tarefa => {
        if (!tarefa || !tarefa.nome) return false;
        
        const nomeTarefaLower = tarefa.nome.toLowerCase();
        if (nomeTarefaLower.match(/(tente sua sorte|try your luck|merge boss|jogo|game)/i)) {
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
      tarefasFiltradas.forEach(t => console.log(`   - ${t.nome} (${t.nomeOriginal})`));
      
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
        
        const success = await executarTarefaEspecificaBilingue(page, tarefa, URL_MOEDAS);
        
        if (success) {
          console.log(`✅ ${tarefa.nome} - EXECUTADA COM SUCESSO (${execucoes + 1} execuções)`);
          tarefasExecutadas++;
          
          if (tarefa.nome.includes('Explore Itens Surpresa')) {
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

// 🔥 FUNÇÃO MELHORADA PARA ABRIR MODAL DE TAREFAS
async function abrirModalTarefasMelhorado(page) {
  try {
    // Primeiro verificar se o modal já está aberto
    const modalAberto = await verificarModalAberto(page);
    if (modalAberto) {
      console.log('✅ Modal já está aberto');
      return true;
    }
    
    console.log('🔍 Procurando botão "Earn more coins"...');
    
    // 🔥 TENTAR DIFERENTES ESTRATÉGIAS PARA ENCONTRAR O BOTÃO
    const botaoEncontrado = await page.evaluate(() => {
      try {
        // ESTRATÉGIA 1: Procurar por texto específico
        const textosProcurados = [
          'earn more coins', 'ganhe mais moedas', 'more coins', 
          'mais moedas', 'earn coins', 'ganhar moedas',
          'daily check-in', 'check-in diário', 'tasks', 'tarefas'
        ];
        
        const todosElementos = Array.from(document.querySelectorAll('button, div, span, a'));
        
        for (const elemento of todosElementos) {
          const texto = elemento.textContent?.toLowerCase() || '';
          const html = elemento.innerHTML?.toLowerCase() || '';
          
          // Verificar se contém algum dos textos procurados
          for (const textoProcurado of textosProcurados) {
            if (texto.includes(textoProcurado) || html.includes(textoProcurado)) {
              if (elemento.offsetWidth > 0 && elemento.offsetHeight > 0) {
                console.log(`🎯 Encontrado botão por texto: "${textoProcurado}"`);
                elemento.click();
                return true;
              }
            }
          }
        }
        
        // ESTRATÉGIA 2: Procurar por elementos com classes específicas
        const classesProcuradas = [
          'signButton', 'earn-button', 'task-button', 'coin-button',
          'daily-button', 'checkin-button', 'more-button'
        ];
        
        for (const classe of classesProcuradas) {
          const elementos = document.querySelectorAll(`[class*="${classe}"]`);
          for (const elemento of elementos) {
            if (elemento.offsetWidth > 0 && elemento.offsetHeight > 0) {
              console.log(`🎯 Encontrado botão por classe: "${classe}"`);
              elemento.click();
              return true;
            }
          }
        }
        
        // ESTRATÉGIA 3: Procurar por botões verdes ou com estilo destacado
        const botoesColoridos = Array.from(document.querySelectorAll('button'));
        for (const botao of botoesColoridos) {
          const style = window.getComputedStyle(botao);
          const bgColor = style.backgroundColor;
          const isGreen = bgColor.includes('rgb(0, 128, 0)') || bgColor.includes('#00a400') || 
                         bgColor.includes('rgb(76, 175, 80)') || bgColor.includes('green');
          
          if (isGreen && botao.offsetWidth > 0 && botao.offsetHeight > 0) {
            console.log('🎯 Encontrado botão por cor verde');
            botao.click();
            return true;
          }
        }
        
        // ESTRATÉGIA 4: Procurar na área inferior da tela (onde geralmente fica o botão)
        const elementosInferiores = Array.from(document.querySelectorAll('button, div'));
        const alturaTela = window.innerHeight;
        
        for (const elemento of elementosInferiores) {
          const rect = elemento.getBoundingClientRect();
          const estaNaParteInferior = rect.top > (alturaTela * 0.6); // 60% da tela para baixo
          
          if (estaNaParteInferior && elemento.offsetWidth > 0 && elemento.offsetHeight > 0) {
            console.log('🎯 Encontrado botão na área inferior');
            elemento.click();
            return true;
          }
        }
        
        console.log('❌ Nenhum botão encontrado');
        return false;
      } catch (e) {
        console.log('Erro ao procurar botão:', e);
        return false;
      }
    });
    
    if (botaoEncontrado) {
      console.log('✅ Botão clicado, aguardando modal abrir...');
      await delay(5000);
      
      // Verificar se o modal abriu
      const modalAbertoAposClick = await verificarModalAberto(page);
      if (modalAbertoAposClick) {
        console.log('✅ Modal aberto com sucesso!');
        return true;
      } else {
        console.log('❌ Modal não abriu após clique');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.log('❌ Erro ao abrir modal:', error.message);
    return false;
  }
}

// 🔥 FUNÇÃO BILÍNGUE PARA OBTER TAREFAS
async function obterTarefasDisponiveisBilingue(page) {
  try {
    const tarefas = await page.evaluate(() => {
      try {
        const resultados = [];
        
        // 🔥 PROCURAR TAREFAS EM DIFERENTES ELEMENTOS
        const seletoresTarefas = [
          '.e2e_normal_task',
          '[class*="task"]',
          '[class*="mission"]',
          '.task-item',
          '.mission-item'
        ];
        
        let todosElementosTarefas = [];
        
        for (const seletor of seletoresTarefas) {
          const elementos = document.querySelectorAll(seletor);
          if (elementos.length > 0) {
            console.log(`🔍 Encontrados ${elementos.length} elementos com seletor: ${seletor}`);
            todosElementosTarefas = todosElementosTarefas.concat(Array.from(elementos));
          }
        }
        
        // Se não encontrou com seletores específicos, procurar qualquer elemento que pareça tarefa
        if (todosElementosTarefas.length === 0) {
          console.log('🔍 Procurando elementos de tarefa genericamente...');
          const todosElementos = Array.from(document.querySelectorAll('div, li, section'));
          todosElementosTarefas = todosElementos.filter(el => {
            const texto = el.textContent || '';
            return texto.includes('Go') || texto.includes('Ir') || 
                   texto.includes('coins') || texto.includes('moedas') ||
                   (el.querySelector('button') && el.offsetWidth > 100);
          });
        }
        
        console.log(`🔍 Total de elementos de tarefa encontrados: ${todosElementosTarefas.length}`);
        
        for (let tarefa of todosElementosTarefas) {
          try {
            // Tentar encontrar título e botão de formas diferentes
            let tituloElement = tarefa.querySelector('.e2e_normal_task_content_title');
            let botaoElement = tarefa.querySelector('.e2e_normal_task_right_btn');
            
            // Se não encontrou com classes específicas, procurar genericamente
            if (!tituloElement || !botaoElement) {
              const todosBotoes = tarefa.querySelectorAll('button');
              const botaoIr = Array.from(todosBotoes).find(btn => 
                btn.textContent?.includes('Go') || btn.textContent?.includes('Ir')
              );
              
              if (botaoIr) {
                botaoElement = botaoIr;
                // Tentar encontrar o título perto do botão
                const elementosTexto = tarefa.querySelectorAll('span, div, p');
                tituloElement = Array.from(elementosTexto).find(el => 
                  el.textContent && el.textContent.length > 10 && !el.textContent.includes('Go') && !el.textContent.includes('Ir')
                );
              }
            }
            
            if (tituloElement && botaoElement) {
              const nome = tituloElement.textContent.trim();
              const botaoVisivel = botaoElement.offsetWidth > 0 && botaoElement.offsetHeight > 0;
              const botaoHabilitado = botaoElement.style.display !== 'none';
              
              const textoBotao = botaoElement.textContent.trim();
              const botaoDisponivel = textoBotao === 'Ir' || textoBotao === 'Go';
              
              if (botaoVisivel && botaoHabilitado && botaoDisponivel) {
                // 🔥 NORMALIZAR NOME DA TAREFA (PT/EN)
                let nomeNormalizado = nome;
                
                // Mapa de traduções COMPLETO
                const mapaTarefas = {
                  // Português para Português (padrão)
                  'explore itens surpresa': 'Explore Itens Surpresa',
                  'procure o que você gosta': 'Procure o que você gosta',
                  'veja os super descontos': 'Veja os super descontos',
                  'descubra itens patrocinados': 'Descubra itens patrocinados',
                  'veja seu "extrato de moedas"': 'Veja seu "Extrato de Moedas"',
                  'caça-descontos': 'Caça-descontos',
                  'cupons e créditos': 'Cupons e créditos',
                  'coletar moedas': 'Coletar Moedas',
                  'check-in diário': 'Check-in Diário',
                  
                  // Inglês para Português
                  'explore surprise items': 'Explore Itens Surpresa',
                  'search what you like': 'Procure o que você gosta', 
                  'see super deals': 'Veja os super descontos',
                  'discover sponsored items': 'Descubra itens patrocinados',
                  'check your coin statement': 'Veja seu "Extrato de Moedas"',
                  'hunt discounts': 'Caça-descontos',
                  'coupons and credits': 'Cupons e créditos',
                  'collect coins': 'Coletar Moedas',
                  'daily check-in': 'Check-in Diário',
                  'browse surprise items': 'Explore Itens Surpresa',
                  'view your coins savings recap': 'Veja seu "Extrato de Moedas"',
                  'view super discounts': 'Veja os super descontos',
                  'finish today\'s check-in': 'Check-in Diário',
                  'browse this page for 15s': 'Veja os super descontos',
                  'browse 15s to see how much': 'Veja seu "Extrato de Moedas"',
                  'tap 3 items on this page': 'Explore Itens Surpresa'
                };
                
                const nomeLower = nome.toLowerCase();
                for (const [key, value] of Object.entries(mapaTarefas)) {
                  if (nomeLower.includes(key)) {
                    nomeNormalizado = value;
                    break;
                  }
                }
                
                resultados.push({
                  nome: nomeNormalizado,
                  nomeOriginal: nome,
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

// 🔥 EXECUTAR TAREFA ESPECÍFICA BILÍNGUE
async function executarTarefaEspecificaBilingue(page, tarefa, urlMoedas) {
  try {
    // 🔥 CLICAR NA TAREFA ESPECÍFICA (BILÍNGUE)
    console.log(`   🔍 Clicando em: ${tarefa.nome} (${tarefa.nomeOriginal})`);
    const clicked = await clicarTarefaEspecificaBilingue(page, tarefa.nome, tarefa.nomeOriginal);
    if (!clicked) return false;

    await delay(3000);

    // 🔥 VERIFICAR SE MUDOU DE PÁGINA
    const urlAtual = page.url();
    
    if (urlAtual.includes('coin-index')) {
      console.log(`   ✅ Tarefa instantânea concluída`);
      return true;
    } else {
      console.log(`   📱 Navegou para tarefa`);
      
      // 🔥 IDENTIFICAR TIPO DE TAREFA PELO NOME (BILÍNGUE)
      const nome = tarefa.nome.toLowerCase();
      
      if (nome.includes('explore itens surpresa')) {
        await executarExploreItensSurpresa(page, urlMoedas);
      } else if (nome.includes('procure o que você gosta') || nome.includes('search what you like')) {
        await executarPesquisa(page, urlMoedas);
      } else if (
        nome.includes('veja os super descontos') || nome.includes('see super deals') ||
        nome.includes('descubra itens patrocinados') || nome.includes('discover sponsored items') ||
        nome.includes('caça-descontos') || nome.includes('hunt discounts') ||
        nome.includes('cupons e créditos') || nome.includes('coupons and credits') ||
        nome.includes('check-in diário') || nome.includes('daily check-in')
      ) {
        console.log('   ⏳ Aguardando 19s...');
        await delay(19000);
        await voltarParaMoedas(page, urlMoedas);
      } else if (nome.includes('veja seu "extrato de moedas"') || nome.includes('check your coin statement')) {
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

// 🔥 CLICAR TAREFA ESPECÍFICA BILÍNGUE
async function clicarTarefaEspecificaBilingue(page, nomeTarefa, nomeOriginal) {
  try {
    const sucesso = await page.evaluate((nomeTarefaProcurada, nomeOriginalProcurado) => {
      try {
        // 🔥 PROCURAR EM DIFERENTES ELEMENTOS
        const seletoresTarefas = [
          '.e2e_normal_task',
          '[class*="task"]',
          '[class*="mission"]',
          '.task-item'
        ];
        
        let todasTarefas = [];
        
        for (const seletor of seletoresTarefas) {
          const elementos = document.querySelectorAll(seletor);
          todasTarefas = todasTarefas.concat(Array.from(elementos));
        }
        
        // Se não encontrou, procurar genericamente
        if (todasTarefas.length === 0) {
          todasTarefas = Array.from(document.querySelectorAll('div, li'));
        }
        
        for (let tarefa of todasTarefas) {
          const titulo = tarefa.querySelector('.e2e_normal_task_content_title') || 
                        Array.from(tarefa.querySelectorAll('span, div, p')).find(el => 
                          el.textContent && el.textContent.length > 10
                        );
          
          if (titulo) {
            const nomeAtual = titulo.textContent.trim();
            const nomeAtualLower = nomeAtual.toLowerCase();
            const nomeProcuradoLower = nomeTarefaProcurada.toLowerCase();
            const nomeOriginalLower = nomeOriginalProcurado.toLowerCase();
            
            // 🔥 VERIFICAÇÃO FLEXÍVEL
            const corresponde = nomeAtual === nomeTarefaProcurada || 
                              nomeAtual === nomeOriginalProcurado ||
                              nomeAtualLower.includes(nomeProcuradoLower) || 
                              nomeAtualLower.includes(nomeOriginalLower);
            
            if (corresponde) {
              let botaoIr = tarefa.querySelector('.e2e_normal_task_right_btn');
              
              // Se não encontrou botão específico, procurar qualquer botão "Go" ou "Ir"
              if (!botaoIr) {
                const todosBotoes = tarefa.querySelectorAll('button');
                botaoIr = Array.from(todosBotoes).find(btn => 
                  btn.textContent?.includes('Go') || btn.textContent?.includes('Ir')
                );
              }
              
              if (botaoIr && botaoIr.offsetWidth > 0) {
                console.log(`🎯 Clicando em: ${nomeAtual}`);
                botaoIr.click();
                return true;
              }
            }
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    }, nomeTarefa, nomeOriginal);

    return sucesso;
  } catch (error) {
    console.log(`   ❌ Erro ao clicar:`, error.message);
    return false;
  }
}

// 🔥 FUNÇÕES AUXILIARES (MANTIDAS)

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

async function verificarModalAberto(page) {
  try {
    return await page.evaluate(() => {
      try {
        // 🔥 VERIFICAR DIFERENTES POSSIBILIDADES DE MODAL
        const seletoresModal = [
          '.aecoin-main-bottom-2_eZO',
          '[class*="modal"]',
          '[class*="task"]',
          '[class*="coin"]',
          '.e2e_normal_task',
          '[class*="bottom"]',
          '[class*="sheet"]'
        ];
        
        for (const seletor of seletoresModal) {
          const modal = document.querySelector(seletor);
          if (modal && modal.offsetWidth > 0 && modal.offsetHeight > 0) {
            console.log(`✅ Modal detectado com seletor: ${seletor}`);
            return true;
          }
        }
        
        // Verificar se há elementos de tarefa visíveis
        const tarefasVisiveis = document.querySelectorAll('.e2e_normal_task');
        if (tarefasVisiveis.length > 0) {
          const primeiraTarefa = tarefasVisiveis[0];
          if (primeiraTarefa.offsetWidth > 0 && primeiraTarefa.offsetHeight > 0) {
            console.log('✅ Modal detectado pelas tarefas visíveis');
            return true;
          }
        }
        
        return false;
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
      const modalAberto = await abrirModalTarefasMelhorado(paginaPrincipal);
      if (!modalAberto) continue;
      await delay(3000);
      
      console.log('2. 🔍 Clicando em "Explore itens surpresa"...');
      const tarefaEncontrada = await clicarTarefaEspecificaBilingue(paginaPrincipal, 'Explore Itens Surpresa', 'Explore itens surpresa');
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
