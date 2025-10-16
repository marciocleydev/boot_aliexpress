# 🔍 Análise: Extensão vs GitHub Actions

Este documento responde à questão: **"Qual é a lógica por trás da extensão de navegador e uma alternativa usando GitHub Actions?"**

---

## 📌 Resposta Direta

### 🔌 Lógica da Extensão de Navegador

A extensão do AliExpress funciona da seguinte forma:

1. **Service Worker (background.bundle.js)**
   - Executa em segundo plano no navegador
   - Configura alarmes para execução automática diária
   - Gerencia comunicação entre componentes
   - Armazena configurações do usuário

2. **Content Script (contentScript.bundle.js)**
   - É injetado automaticamente em todas as páginas do AliExpress
   - Monitora quando o usuário acessa a página de moedas
   - Identifica botões de "Claim/Resgatar" usando seletores CSS
   - Simula cliques automáticos nos botões
   - Coleta moedas disponíveis

3. **Popup (popup.html/js)**
   - Interface visual para o usuário
   - Mostra status de moedas coletadas
   - Permite configurar horários e preferências
   - Botão para coleta manual

**Fluxo de Funcionamento:**
```
[Usuário logado no AliExpress] 
    ↓
[Content Script detecta página de moedas]
    ↓
[Busca botões com seletores: .coin-task-claim, .task-claim-btn, etc]
    ↓
[Valida se botão está visível e habilitado]
    ↓
[Simula clique usando element.click()]
    ↓
[Moedas são coletadas automaticamente]
```

### ⚙️ Alternativa com GitHub Actions

O GitHub Actions automatiza o mesmo processo, mas de forma diferente:

1. **Workflow YAML (.github/workflows/aliexpress-coins.yml)**
   - Define quando executar (schedule com cron)
   - Especifica o ambiente (Ubuntu + Node.js)
   - Lista os passos da automação

2. **Script Puppeteer (scripts/automate-coins.js)**
   - Abre um navegador headless (sem interface visual)
   - Faz login com credenciais armazenadas em secrets
   - Navega até a página de moedas
   - Busca botões usando os mesmos seletores da extensão
   - Clica programaticamente nos botões
   - Gera screenshots e logs

3. **GitHub Actions Runner**
   - Máquina virtual na nuvem do GitHub
   - Executa o workflow nos horários agendados
   - Salva screenshots como artifacts
   - Disponibiliza logs de execução

**Fluxo de Funcionamento:**
```
[GitHub Actions trigger (cron: 0 2,14 * * *)]
    ↓
[Runner instala Node.js e Puppeteer]
    ↓
[Script abre navegador headless]
    ↓
[Login automático com secrets]
    ↓
[Navega para página de moedas]
    ↓
[Busca e clica em botões (mesmo algoritmo da extensão)]
    ↓
[Screenshots + logs salvos como artifacts]
```

---

## 🔄 Comparação Técnica Detalhada

### Algoritmo de Detecção de Botões (Idêntico em ambos)

**Extensão (Content Script):**
```javascript
// Executado no contexto da página do AliExpress
const buttons = document.querySelectorAll([
  '.coin-task-claim',
  '.task-claim-btn', 
  'button[class*="claim"]',
  '[data-role="claim"]'
].join(','));

buttons.forEach(button => {
  if (isVisibleAndClickable(button)) {
    button.click();
  }
});
```

**GitHub Actions (Puppeteer):**
```javascript
// Executado via automação no navegador headless
const buttons = await page.$$([
  '.coin-task-claim',
  '.task-claim-btn',
  'button[class*="claim"]', 
  '[data-role="claim"]'
].join(','));

for (const button of buttons) {
  const isVisible = await button.evaluate(el => 
    el.offsetWidth > 0 && el.offsetHeight > 0
  );
  if (isVisible) {
    await button.click();
  }
}
```

**Diferença:** 
- Extensão executa no DOM real do navegador do usuário
- GitHub Actions executa em navegador virtual controlado por Puppeteer

### Autenticação

| Aspecto | Extensão | GitHub Actions |
|---------|----------|----------------|
| **Como funciona** | Usa cookies/sessão do navegador | Faz login programaticamente |
| **Credenciais** | Não precisa (usuário já logado) | Requer email/senha em secrets |
| **Segurança** | Alta (local) | Média (secrets no GitHub) |
| **Manutenção** | Baixa (login manual ocasional) | Baixa (automatizado) |

### Agendamento

| Aspecto | Extensão | GitHub Actions |
|---------|----------|----------------|
| **Método** | chrome.alarms API | Cron expressions |
| **Precisão** | ±1 minuto | ±1 minuto |
| **Configuração** | Via interface popup | Via arquivo YAML |
| **Exemplo** | `chrome.alarms.create('coins', {periodInMinutes: 1440})` | `cron: '0 2,14 * * *'` |

### Execução

| Aspecto | Extensão | GitHub Actions |
|---------|----------|----------------|
| **Local** | Navegador do usuário | Servidor GitHub (nuvem) |
| **Requer** | Navegador aberto | Nada (totalmente automático) |
| **Velocidade** | Rápida (local) | Média (cold start ~30s) |
| **Logs** | Console do navegador | GitHub Actions UI |

---

## 💡 Quando Usar Cada Solução

### ✅ Use a Extensão se:

1. **Privacidade é prioridade**
   - Não quer armazenar credenciais em nenhum lugar
   - Prefere execução local

2. **Navegador sempre aberto**
   - Usa Chrome/Edge diariamente
   - Não se importa com o navegador rodando em background

3. **Simplicidade**
   - Quer instalar e esquecer
   - Não quer configurar secrets/workflows

4. **Interação manual**
   - Gosta de ver o processo acontecendo
   - Quer controle sobre quando executar

### ✅ Use GitHub Actions se:

1. **Automação total**
   - Quer verdadeiro "set and forget"
   - Não quer depender de dispositivo local

2. **Múltiplas contas**
   - Gerencia várias contas AliExpress
   - Precisa de execuções paralelas

3. **Histórico e auditoria**
   - Quer logs permanentes
   - Precisa de screenshots de cada execução

4. **Flexibilidade**
   - Quer horários customizados
   - Precisa integrar com outras automações

---

## 🔧 Como Funcionam os Componentes

### Extensão: Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Ali Coin Saver",
  
  // Service Worker - Background
  "background": {
    "service_worker": "background.bundle.js"
  },
  
  // Content Script - Injetado nas páginas
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["contentScript.bundle.js"],
    "run_at": "document_start"
  }],
  
  // Permissões necessárias
  "permissions": [
    "tabs",        // Gerenciar abas
    "storage",     // Salvar configurações
    "alarms",      // Agendar tarefas
    "scripting"    // Injetar scripts
  ]
}
```

**Ciclo de vida:**
1. Service Worker ativo 24/7 (com idle)
2. Alarme dispara no horário configurado
3. Service Worker cria/ativa aba do AliExpress
4. Content Script é injetado automaticamente
5. Content Script executa lógica de coleta
6. Notifica usuário do resultado

### GitHub Actions: Workflow

```yaml
name: Resgatar Moedas
on:
  schedule:
    - cron: '0 2,14 * * *'  # 2h e 14h UTC
    
jobs:
  automacao:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install puppeteer
      - run: node scripts/automate-coins.js
        env:
          ALIEXPRESS_EMAIL: ${{ secrets.ALIEXPRESS_EMAIL }}
          ALIEXPRESS_PASSWORD: ${{ secrets.ALIEXPRESS_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: "*.png"
```

**Ciclo de vida:**
1. GitHub dispara workflow no horário do cron
2. Provisiona VM Ubuntu fresh
3. Instala Node.js e Puppeteer
4. Executa script com secrets como env vars
5. Script abre navegador headless
6. Realiza login e coleta moedas
7. Salva screenshots e logs
8. VM é destruída

---

## 🎯 Recomendação Final

### Cenário Ideal: **Usar ambos!**

**Estratégia combinada:**

1. **GitHub Actions** como principal
   - Execução diária automática
   - Confiabilidade de horário
   - Histórico completo

2. **Extensão** como backup/manual
   - Coletas extras quando necessário
   - Verificar status rapidamente
   - Funciona se GitHub Actions falhar

**Configuração sugerida:**

- **GitHub Actions:** 2x ao dia (2h e 14h UTC)
- **Extensão:** Coleta manual quando ver novas tarefas

### Implementação

1. **Configure GitHub Actions primeiro:**
   ```bash
   # 1. Fork o repositório
   # 2. Adicione secrets (ALIEXPRESS_EMAIL, ALIEXPRESS_PASSWORD)
   # 3. Ative GitHub Actions
   # 4. Aguarde execução automática
   ```

2. **Instale a extensão depois:**
   ```bash
   # 1. Chrome → Extensões → Modo desenvolvedor
   # 2. Carregar sem compactação → pasta /aliexpress
   # 3. Fazer login no AliExpress
   # 4. Configurar popup
   ```

---

## 📊 Métricas de Comparação

| Métrica | Extensão | GitHub Actions |
|---------|----------|----------------|
| **Tempo de setup** | 2 minutos | 5 minutos |
| **Confiabilidade** | 95% | 85% |
| **Privacidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Automação** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenção** | Baixa | Média |
| **Custo** | R$ 0 | R$ 0 (free tier) |
| **Escalabilidade** | 1 conta | N contas |

---

## 🚀 Próximos Passos

### Para Implementar a Extensão:
1. Leia: [README.md](README.md) seção "Extensão de Navegador"
2. Instale a extensão em Chrome/Edge
3. Configure alarmes no popup

### Para Implementar GitHub Actions:
1. Leia: [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
2. Configure secrets no repositório
3. Ative o workflow
4. Monitore primeiras execuções

### Para Usar Ambos:
1. Configure GitHub Actions primeiro (automação base)
2. Instale extensão depois (complemento manual)
3. Monitore resultados de ambos
4. Ajuste horários para não conflitar

---

## 📝 Conclusão

**A lógica por trás da extensão:** 
- Service Worker agenda tarefas
- Content Scripts detectam e clicam botões
- Tudo executa no navegador do usuário

**A alternativa com GitHub Actions:**
- Workflow agenda via cron
- Puppeteer simula navegador headless
- Tudo executa na nuvem do GitHub

**Ambos usam a mesma lógica central de detecção de botões, mas diferem em:**
- Local de execução (browser vs cloud)
- Autenticação (sessão vs credentials)
- Agendamento (alarms API vs cron)
- Interface (popup vs web UI)

**Melhor solução:** Use os dois em conjunto para máxima confiabilidade! 🎯
