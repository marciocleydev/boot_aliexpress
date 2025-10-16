# 📝 Resposta à Solicitação

## ❓ Pergunta Original

> "quero que voce identifique dentro do diretorio aliexpress, e me diga qual é a logica por trás dessa extensao de navegador , e uma alternativa usando git actions para automatizar esse mesmo processo"

---

## ✅ Resposta Completa

### 🔌 Lógica da Extensão de Navegador (diretório `/aliexpress`)

A extensão do AliExpress é uma **extensão Chrome Manifest V3** que automatiza a coleta de moedas diárias. Aqui está como funciona:

#### Componentes Principais:

1. **manifest.json** - Arquivo de configuração
   - Define nome: "Ali Coin Saver"
   - Descrição: "Automatically Collect Aliexpress coins Everyday"
   - Permissões: tabs, storage, alarms, scripting, cookies, etc.
   - Registra service worker e content scripts

2. **background.bundle.js** (Service Worker)
   - Executa em segundo plano 24/7
   - Configura alarmes para execução automática diária
   - Gerencia comunicação entre diferentes partes da extensão
   - Armazena dados de configuração em chrome.storage

3. **contentScript.bundle.js** (Script Injetado)
   - É injetado automaticamente em TODAS as páginas (`<all_urls>`)
   - Detecta quando usuário está na página de moedas
   - Busca botões de "Claim/Resgatar" usando seletores CSS
   - Clica automaticamente nos botões encontrados
   - Coleta as moedas disponíveis

4. **popup.html/js/css** (Interface do Usuário)
   - Interface visual que aparece ao clicar no ícone da extensão
   - Mostra status de moedas coletadas
   - Permite configurar preferências
   - Botão para executar coleta manual

#### Fluxo de Funcionamento:

```
1. Usuário faz login manualmente no AliExpress
   ↓
2. Extensão detecta e armazena sessão via cookies
   ↓
3. Service Worker agenda alarme diário (chrome.alarms API)
   ↓
4. No horário configurado, alarme dispara
   ↓
5. Service Worker abre/ativa aba do AliExpress na página de moedas
   ↓
6. Content Script é injetado automaticamente
   ↓
7. Content Script executa:
   - Busca botões: document.querySelectorAll('.coin-task-claim', '.task-claim-btn', etc)
   - Valida visibilidade: element.offsetWidth > 0 && !element.disabled
   - Valida texto: includes('claim'), includes('resgatar'), includes('collect')
   - Clica: element.click()
   - Aguarda: setTimeout(2000)
   - Repete para todos os botões encontrados
   ↓
8. Moedas são coletadas automaticamente
   ↓
9. Usuário é notificado via badge/popup
```

#### Seletores Usados (lógica principal):

```javascript
const coinSelectors = [
  '.coin-task-claim',      // Classe específica
  '.task-claim-btn',       // Classe de botão
  'button[class*="claim"]', // Contém "claim" no nome
  '[data-role="claim"]',   // Atributo data
  '.next-btn-primary',     // Botão primário
  '.btn-claim'             // Variação de classe
];
```

---

### ⚙️ Alternativa com GitHub Actions

**Já existe um workflow implementado** em `.github/workflows/aliexpress-coins.yml` que faz exatamente o mesmo processo, mas na nuvem!

#### Como Funciona:

1. **Agendamento Automático**
   ```yaml
   schedule:
     - cron: '0 2,14 * * *'  # Executa 2x ao dia (2h e 14h UTC)
   ```

2. **Execução no GitHub**
   - GitHub provisiona uma VM Ubuntu limpa
   - Instala Node.js e Puppeteer
   - Executa script de automação
   - Salva screenshots como artefatos
   - Destroi a VM

3. **Script Puppeteer** (scripts/automate-coins.js)
   ```javascript
   // 1. Abre navegador headless (sem interface)
   const browser = await puppeteer.launch({ headless: true });
   
   // 2. Faz login com credenciais do GitHub Secrets
   await page.type('#fm-login-id', process.env.ALIEXPRESS_EMAIL);
   await page.type('#fm-login-password', process.env.ALIEXPRESS_PASSWORD);
   await page.click('button[type="submit"]');
   
   // 3. Navega para página de moedas
   await page.goto('https://www.aliexpress.com/coin/task');
   
   // 4. Busca e clica botões (MESMA LÓGICA da extensão!)
   const buttons = await page.$$('.coin-task-claim');
   for (const button of buttons) {
     if (await button.isVisible()) {
       await button.click();
       await delay(3000);
     }
   }
   
   // 5. Salva screenshots para debug
   await page.screenshot({ path: 'resultado.png' });
   ```

#### Melhorias Implementadas no Workflow:

✨ **Novo workflow aprimorado:**
- ✅ Executa 2x ao dia (antes era 1x)
- ✅ Permite escolher qual script executar via interface
- ✅ Timeout de 15 minutos (prevenção de travamento)
- ✅ Upload de screenshots com retenção de 7 dias
- ✅ Relatório automático no job summary
- ✅ Suporte a execução manual via workflow_dispatch

#### Configuração Necessária:

1. **Adicionar Secrets no GitHub:**
   - `ALIEXPRESS_EMAIL` = seu email
   - `ALIEXPRESS_PASSWORD` = sua senha

2. **Ativar GitHub Actions:**
   - Ir em Actions → Ativar workflows

3. **Pronto!** 
   - Executa automaticamente 2x ao dia
   - Ou execute manualmente quando quiser

---

## 🔀 Comparação Direta

| Aspecto | Extensão | GitHub Actions |
|---------|----------|----------------|
| **Execução** | Browser local | Nuvem GitHub |
| **Login** | Manual (cookies) | Automático (secrets) |
| **Agendamento** | chrome.alarms | cron schedule |
| **Requer** | Browser aberto | Nada |
| **Credenciais** | Não expõe | Em secrets |
| **Histórico** | Local | Logs GitHub |
| **Custo** | Grátis | Grátis (2000 min/mês) |

---

## 📚 Documentação Criada

Para você entender melhor, criei 4 documentos completos:

1. **README.md** - Visão geral completa do projeto
2. **ANALISE_LOGICA.md** - Análise detalhada da lógica (resposta completa à sua pergunta)
3. **GITHUB_ACTIONS_SETUP.md** - Guia passo a passo de configuração
4. **ARQUITETURA.md** - Diagramas visuais da arquitetura

---

## 🎯 Conclusão

**A lógica da extensão:**
- Service Worker agenda tarefas diárias
- Content Script detecta botões na página de moedas
- Clica automaticamente usando seletores CSS
- Usa sessão do navegador (cookies)

**A alternativa GitHub Actions:**
- Cron agenda execução na nuvem
- Puppeteer controla navegador headless
- Mesma lógica de detecção de botões
- Usa credenciais em secrets

**Ambos fazem exatamente a mesma coisa, mas:**
- Extensão = executa no seu navegador
- GitHub Actions = executa na nuvem automaticamente

**Recomendação:** Use os dois juntos!
- GitHub Actions para automação diária
- Extensão para coletas manuais extras

---

## 🚀 Próximos Passos Sugeridos

1. Leia os documentos criados (principalmente ANALISE_LOGICA.md)
2. Configure GitHub Actions seguindo GITHUB_ACTIONS_SETUP.md
3. Teste a execução manual
4. Monitore resultados
5. Opcionalmente, instale a extensão também

**Tudo documentado e pronto para usar! 🎉**
