# 🏗️ Arquitetura do Projeto

Este documento apresenta a arquitetura visual das duas soluções de automação.

---

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    AliExpress Automation                     │
│                                                              │
│  ┌──────────────────────┐      ┌───────────────────────┐   │
│  │  Browser Extension   │      │   GitHub Actions      │   │
│  │   (Manifest V3)      │      │   (Cloud Automation)  │   │
│  └──────────────────────┘      └───────────────────────┘   │
│           ↓                              ↓                  │
│  ┌──────────────────────┐      ┌───────────────────────┐   │
│  │   User's Browser     │      │   GitHub Runner VM    │   │
│  └──────────────────────┘      └───────────────────────┘   │
│           ↓                              ↓                  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                │
│              ┌──────────────────────────┐                   │
│              │  AliExpress Website      │                   │
│              │  /coin/task              │                   │
│              └──────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Arquitetura da Extensão de Navegador

```
┌─────────────────────────────────────────────────────────────┐
│                  Chrome/Edge Browser                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Extension Components                                 │  │
│  │                                                       │  │
│  │  ┌─────────────────┐         ┌──────────────────┐   │  │
│  │  │ manifest.json   │────────▶│ Service Worker   │   │  │
│  │  │ (Configuration) │         │ background.js    │   │  │
│  │  └─────────────────┘         └──────────────────┘   │  │
│  │                                       │              │  │
│  │                                       ├──────────────│──▶ chrome.alarms API
│  │                                       │              │  │   (Schedule tasks)
│  │                                       │              │  │
│  │                                       ▼              │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │         Content Script (Injected)           │   │  │
│  │  │         contentScript.bundle.js             │   │  │
│  │  │                                             │   │  │
│  │  │  1. Detect coin page                       │   │  │
│  │  │  2. Find buttons (.coin-task-claim)        │   │  │
│  │  │  3. Validate visibility                    │   │  │
│  │  │  4. Click buttons                          │   │  │
│  │  │  5. Collect coins                          │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                       │                             │  │
│  │                       ▼                             │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │         Popup UI (User Interface)           │   │  │
│  │  │         popup.html + popup.js               │   │  │
│  │  │                                             │   │  │
│  │  │  • Show coin status                        │   │  │
│  │  │  • Manual trigger button                   │   │  │
│  │  │  • Settings                                │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           ↓
                ┌────────────────────┐
                │  AliExpress.com    │
                │  (User's session)  │
                └────────────────────┘
```

### Fluxo de Dados - Extensão

```
User Login (Manual)
        ↓
Service Worker starts
        ↓
Schedule alarm (daily)
        ↓
Alarm triggers
        ↓
Open/Focus AliExpress tab
        ↓
Content Script injected
        ↓
Detect coin page: page.url.includes('/coin/task')
        ↓
Query buttons: document.querySelectorAll('.coin-task-claim')
        ↓
Validate: button.offsetWidth > 0 && !button.disabled
        ↓
Click: button.click()
        ↓
Wait: setTimeout(2000)
        ↓
Next button or Complete
        ↓
Notify user via popup badge
```

---

## ⚙️ Arquitetura GitHub Actions

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Cloud                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repository: marciocleydev/boot_aliexpress           │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  .github/workflows/aliexpress-coins.yml     │    │  │
│  │  │                                             │    │  │
│  │  │  on:                                        │    │  │
│  │  │    schedule:                                │    │  │
│  │  │      - cron: '0 2,14 * * *'                │    │  │
│  │  │    workflow_dispatch:                       │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                       │                              │  │
│  │                       ▼                              │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │         GitHub Actions Runner                │    │  │
│  │  │         (Ubuntu VM)                          │    │  │
│  │  │                                             │    │  │
│  │  │  Steps:                                     │    │  │
│  │  │  1. ✓ Checkout code                        │    │  │
│  │  │  2. ✓ Setup Node.js 20                     │    │  │
│  │  │  3. ✓ Install puppeteer                    │    │  │
│  │  │  4. ✓ Run automation script                │    │  │
│  │  │  5. ✓ Upload screenshots                   │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                       │                              │  │
│  │                       ▼                              │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │         Automation Script                    │    │  │
│  │  │         scripts/automate-coins.js            │    │  │
│  │  │                                             │    │  │
│  │  │  const browser = await puppeteer.launch()   │    │  │
│  │  │  const page = await browser.newPage()       │    │  │
│  │  │  await page.goto('aliexpress.com')          │    │  │
│  │  │  // ... login, navigate, click buttons      │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                       │                              │  │
│  │                       ▼                              │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │         Headless Chrome                      │    │  │
│  │  │         (Controlled by Puppeteer)            │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           ↓
                ┌────────────────────┐
                │  AliExpress.com    │
                │  (Bot session)     │
                └────────────────────┘
                           ↓
                ┌────────────────────┐
                │  Screenshots +     │
                │  Logs saved as     │
                │  Artifacts         │
                └────────────────────┘
```

### Fluxo de Dados - GitHub Actions

```
GitHub Cron trigger (2h or 14h UTC)
        ↓
Provision Ubuntu VM
        ↓
git clone repository
        ↓
npm install puppeteer
        ↓
Load secrets: ALIEXPRESS_EMAIL, ALIEXPRESS_PASSWORD
        ↓
node scripts/automate-coins.js
        ↓
Launch headless browser
        ↓
Navigate: await page.goto('login.aliexpress.com')
        ↓
Type credentials: await page.type('#fm-login-id', email)
        ↓
Submit: await page.click('button[type="submit"]')
        ↓
Wait: await delay(8000)
        ↓
Navigate: await page.goto('/coin/task')
        ↓
Find buttons: await page.$$('.coin-task-claim')
        ↓
Validate: await button.evaluate(el => el.offsetWidth > 0)
        ↓
Click: await button.click()
        ↓
Wait: await delay(3000)
        ↓
Screenshot: await page.screenshot({path: 'result.png'})
        ↓
Upload artifacts
        ↓
Destroy VM
```

---

## 🔍 Comparação de Componentes

### Service Worker vs GitHub Actions Runner

```
┌──────────────────────┬─────────────────────────────────────┐
│  Service Worker      │  GitHub Actions Runner              │
├──────────────────────┼─────────────────────────────────────┤
│  • Always running    │  • Created on demand                │
│  • Low memory usage  │  • Full VM (2 cores, 7GB RAM)       │
│  • Browser context   │  • Clean environment                │
│  • chrome.* APIs     │  • Node.js + npm packages           │
│  • User's cookies    │  • Secrets for credentials          │
└──────────────────────┴─────────────────────────────────────┘
```

### Content Script vs Puppeteer

```
┌──────────────────────┬─────────────────────────────────────┐
│  Content Script      │  Puppeteer                          │
├──────────────────────┼─────────────────────────────────────┤
│  • Runs in DOM       │  • Controls browser remotely        │
│  • Direct access     │  • Async API                        │
│  • Fast execution    │  • Network overhead                 │
│  • Limited by CSP    │  • Full control                     │
│  • User's session    │  • Separate session                 │
└──────────────────────┴─────────────────────────────────────┘
```

---

## 🎯 Algoritmo Central (Compartilhado)

Ambas soluções usam o mesmo algoritmo de detecção:

```
┌─────────────────────────────────────────────────┐
│         Button Detection Algorithm              │
│                                                 │
│  1. Define selectors array:                    │
│     ['.coin-task-claim',                       │
│      '.task-claim-btn',                        │
│      'button[class*="claim"]',                 │
│      '[data-role="claim"]']                    │
│                                                 │
│  2. Query all matching elements:               │
│     elements = querySelectorAll(selectors)     │
│                                                 │
│  3. For each element:                          │
│     ┌─────────────────────────────────┐       │
│     │ Check visibility:                │       │
│     │   offsetWidth > 0               │       │
│     │   offsetHeight > 0              │       │
│     │   !disabled                     │       │
│     └─────────────────────────────────┘       │
│              ↓                                 │
│     ┌─────────────────────────────────┐       │
│     │ Check text content:              │       │
│     │   includes('claim')             │       │
│     │   includes('resgatar')          │       │
│     │   includes('collect')           │       │
│     │   matches(/^\d+$/)              │       │
│     └─────────────────────────────────┘       │
│              ↓                                 │
│     ┌─────────────────────────────────┐       │
│     │ Execute click:                   │       │
│     │   element.click()               │       │
│     └─────────────────────────────────┘       │
│              ↓                                 │
│     ┌─────────────────────────────────┐       │
│     │ Wait:                            │       │
│     │   delay(2000-3000ms)            │       │
│     └─────────────────────────────────┘       │
│                                                 │
│  4. Count successful clicks                    │
│  5. Report results                             │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida Completo

### Extensão - Ciclo Diário

```
Day 1 00:00 ────┐
                │
                ▼
        ┌───────────────┐
        │ User installs │
        │  extension    │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ User logs in  │
        │  AliExpress   │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Set alarm     │
        │  (daily 10h)  │
        └───────────────┘
                │
Day 1 10:00 ────┤
                │
                ▼
        ┌───────────────┐
        │ Alarm fires   │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Open coin tab │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Click buttons │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Coins claimed │
        └───────────────┘
                │
Day 2 10:00 ────┘ (repeat)
```

### GitHub Actions - Ciclo Diário

```
Day 1 02:00 UTC ┐
                │
                ▼
        ┌───────────────┐
        │ Cron triggers │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Create VM     │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Install deps  │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Run script    │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Login bot     │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Navigate page │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Click buttons │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Save results  │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Destroy VM    │
        └───────────────┘
                │
Day 1 14:00 UTC ┘ (repeat)
```

---

## 📈 Estatísticas de Performance

### Tempo de Execução

```
Extension:
├─ Alarm trigger: 0ms
├─ Tab open: 100-500ms
├─ Page load: 1-3s
├─ Button detection: 100-200ms
├─ Click actions: 2-5s
└─ Total: ~3-8s

GitHub Actions:
├─ VM provision: 10-30s
├─ npm install: 20-40s
├─ Browser launch: 2-5s
├─ Navigation: 3-5s
├─ Login: 5-10s
├─ Page load: 2-4s
├─ Button detection: 1-2s
├─ Click actions: 3-6s
└─ Total: ~46-102s
```

### Uso de Recursos

```
Extension:
├─ Memory: ~50-100MB
├─ CPU: <1%
├─ Network: Minimal (user's browsing)
└─ Storage: <5MB

GitHub Actions:
├─ Memory: ~500-1000MB
├─ CPU: 10-30% (VM)
├─ Network: ~50-100MB download
└─ Storage: ~500MB (cached)
```

---

## 🔐 Fluxo de Autenticação

### Extensão (Cookie-based)

```
User ──► Browser ──► AliExpress
                         │
                         ▼
                   Set-Cookie: session=xyz
                         │
                         ▼
                   Stored in browser
                         │
                         ▼
           Extension reads cookies automatically
                         │
                         ▼
              All requests authenticated
```

### GitHub Actions (Credential-based)

```
User ──► GitHub Secrets ──► Runner VM
                                │
                                ▼
                     ALIEXPRESS_EMAIL=xxx
                     ALIEXPRESS_PASSWORD=yyy
                                │
                                ▼
                        Puppeteer script
                                │
                                ▼
                        await page.type()
                                │
                                ▼
                        Submit login form
                                │
                                ▼
                        Session established
                                │
                                ▼
                        Make authenticated requests
```

---

## 🎓 Resumo Arquitetural

**Extensão:**
- Client-side execution
- Event-driven (alarms, tabs)
- Session reuse
- Real browser automation

**GitHub Actions:**
- Server-side execution
- Schedule-driven (cron)
- Headless simulation
- Virtual browser automation

**Ponto em Comum:**
- Mesmo algoritmo de detecção de botões
- Mesmo objetivo (coletar moedas)
- Mesma lógica de validação

**Diferenças Fundamentais:**
- Local de execução (client vs cloud)
- Método de autenticação (cookies vs credentials)
- Tipo de automação (real browser vs headless)
