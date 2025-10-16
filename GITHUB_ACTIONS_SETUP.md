# ⚙️ Guia de Configuração - GitHub Actions

Este guia explica como configurar e usar a automação do AliExpress via GitHub Actions.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Execução](#execução)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)
- [Melhorias Avançadas](#melhorias-avançadas)

---

## ✅ Pré-requisitos

1. Conta no GitHub (gratuita)
2. Fork deste repositório
3. Conta no AliExpress

---

## 🚀 Configuração Inicial

### Passo 1: Fork do Repositório

1. Clique em **Fork** no topo desta página
2. Aguarde a cópia ser criada na sua conta

### Passo 2: Configurar Secrets (Opcional)

⚠️ **Necessário apenas para scripts com login (`login-focado.js` e `automate-coins.js`)**

1. Vá para: **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

   ```
   Nome: ALIEXPRESS_EMAIL
   Valor: seu-email@exemplo.com
   ```

   ```
   Nome: ALIEXPRESS_PASSWORD
   Valor: sua_senha_segura
   ```

   ![Exemplo de configuração de secrets](https://docs.github.com/assets/images/help/settings/actions-secrets-settings.png)

### Passo 3: Ativar GitHub Actions

1. Vá para a aba **Actions**
2. Se solicitado, clique em **I understand my workflows, go ahead and enable them**
3. Pronto! O workflow está ativo

---

## 🎯 Execução

### Execução Automática

O workflow está configurado para executar **automaticamente** nos seguintes horários:

- **2h UTC** (23h BRT do dia anterior)
- **14h UTC** (11h BRT)

Você não precisa fazer nada! O GitHub executará automaticamente.

### Execução Manual

Para executar manualmente a qualquer momento:

1. Vá para **Actions** → **🪙 Resgatar Moedas AliExpress**
2. Clique em **Run workflow**
3. Selecione o script desejado:
   - `script-basico.js` - Sem login (padrão)
   - `login-focado.js` - Com login simplificado
   - `automate-coins.js` - Com login e modo stealth completo
4. Clique em **Run workflow**

![Execução manual](https://docs.github.com/assets/images/help/actions/workflow-dispatch-run-workflow.png)

---

## 📊 Monitoramento

### Verificar Execução

1. Vá para **Actions**
2. Clique na execução mais recente
3. Expanda os steps para ver logs detalhados

### Ver Screenshots

Cada execução gera screenshots para debug:

1. Na página da execução, role até o final
2. Seção **Artifacts**
3. Baixe `screenshots-{número}`
4. Descompacte o ZIP para ver as imagens

Exemplos de screenshots gerados:
- `1-pagina-inicial.png` - Página inicial do AliExpress
- `2-pos-login.png` - Após o login
- `3-pagina-moedas.png` - Página de moedas
- `5-resultado-final.png` - Estado final

### Interpretar Logs

Exemplo de log de sucesso:
```
🚀 Iniciando automação AliExpress...
1. 📱 Acessando AliExpress...
✅ Página carregada: AliExpress
2. 🪙 Tentando diferentes URLs de moedas...
   ✅ URL funcionou: https://www.aliexpress.com/coin/task
4. 🔄 Procurando botões PARA RESGATAR...
🎯 3 botões clicados: [{texto: "Claim 10 coins"}, ...]
🎉 Automação concluída!
```

Exemplo de log com erro:
```
❌ Erro no login: Timeout waiting for selector
💥 Erro geral: Navigation failed
```

---

## 🔧 Troubleshooting

### Problema: Workflow não executa automaticamente

**Solução:**
1. Verifique se as Actions estão ativadas em **Settings** → **Actions**
2. O repositório precisa ter pelo menos 1 commit nos últimos 60 dias
3. Faça um commit qualquer para reativar

### Problema: Login falha

**Possíveis causas:**
1. Credenciais incorretas nos Secrets
2. AliExpress bloqueou o IP do GitHub
3. Captcha obrigatório

**Soluções:**
1. Verifique os Secrets
2. Use o `script-basico.js` que não requer login
3. Execute manualmente após alguns dias

### Problema: Não encontra botões de moedas

**Causas:**
1. AliExpress mudou o layout
2. Moedas já foram coletadas
3. Conta não elegível

**Soluções:**
1. Atualize os seletores no script
2. Verifique manualmente no site
3. Tente em outro horário

### Problema: Timeout

**Solução:**
Aumente o timeout no script:
```javascript
await page.goto(url, { 
  waitUntil: 'networkidle2',
  timeout: 60000  // Aumentar para 60s
});
```

---

## 🚀 Melhorias Avançadas

### 1. Múltiplas Contas

Edite `.github/workflows/aliexpress-coins.yml`:

```yaml
jobs:
  automacao:
    strategy:
      matrix:
        account:
          - name: conta1
            email: CONTA1_EMAIL
            password: CONTA1_PASSWORD
          - name: conta2
            email: CONTA2_EMAIL
            password: CONTA2_PASSWORD
    
    env:
      ALIEXPRESS_EMAIL: ${{ secrets[matrix.account.email] }}
      ALIEXPRESS_PASSWORD: ${{ secrets[matrix.account.password] }}
```

Configure os secrets:
- `CONTA1_EMAIL`, `CONTA1_PASSWORD`
- `CONTA2_EMAIL`, `CONTA2_PASSWORD`

### 2. Notificações no Telegram

Adicione step no workflow:

```yaml
- name: 📱 Notificar Telegram
  if: always()
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🪙 Coleta de moedas: ${{ job.status }}
      📅 ${{ github.event.head_commit.message }}
```

Configure secrets:
- `TELEGRAM_BOT_TOKEN` (do @BotFather)
- `TELEGRAM_CHAT_ID` (seu ID)

### 3. Retry Automático

Adicione step com retry:

```yaml
- name: 🔄 Executar com retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_wait_seconds: 30
    command: node scripts/automate-coins.js
```

### 4. Horários Personalizados

Edite o cron para seus horários preferidos:

```yaml
schedule:
  - cron: '0 6,12,18 * * *'  # 3x ao dia: 6h, 12h, 18h UTC
  - cron: '30 */4 * * *'     # A cada 4 horas aos 30min
  - cron: '0 9 * * 1-5'      # Dias úteis às 9h UTC
```

Use [crontab.guru](https://crontab.guru) para testar expressões cron.

### 5. Variáveis de Ambiente

Centralize configurações em secrets:

```yaml
env:
  HEADLESS: ${{ secrets.HEADLESS_MODE || 'true' }}
  TIMEOUT: ${{ secrets.TIMEOUT || '30000' }}
  SCREENSHOT: ${{ secrets.ENABLE_SCREENSHOT || 'true' }}
```

### 6. Matrix de Scripts

Execute múltiplos scripts em paralelo:

```yaml
strategy:
  matrix:
    script: 
      - script-basico.js
      - login-focado.js
      - automate-coins.js
steps:
  - run: node scripts/${{ matrix.script }}
```

---

## 📈 Monitoramento Avançado

### Job Summary

O workflow gera um relatório automático após cada execução. Veja em:

**Actions** → **Execução** → **Summary**

Exemplo:
```
## 🎯 Resultado da Automação

- **Script executado:** automate-coins.js
- **Data/Hora:** 2024-01-15 14:00:00
- **Status:** success

✅ Screenshots capturados com sucesso
🪙 5 moedas coletadas
⏱️ Tempo de execução: 2m 34s
```

### Logs Estruturados

Para logs mais organizados, adicione ao script:

```javascript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'coin_claimed',
  coins: 10,
  button: 'Daily Check-in'
}));
```

Parse com:
```bash
cat workflow.log | jq -r 'select(.event == "coin_claimed")'
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite credenciais** no código
2. **Use Secrets** para dados sensíveis
3. **Limite permissões** do workflow
4. **Revise logs** antes de compartilhar
5. **Rotacione senhas** periodicamente

### Secrets Recomendados

```
ALIEXPRESS_EMAIL       # Obrigatório para login
ALIEXPRESS_PASSWORD    # Obrigatório para login
TELEGRAM_BOT_TOKEN     # Opcional - notificações
TELEGRAM_CHAT_ID       # Opcional - notificações
```

### Auditoria

Verifique acessos aos secrets em:
**Settings** → **Secrets and variables** → **Actions** → **Secret**

---

## 💰 Custos

### GitHub Actions - Gratuito

**Plano Free:**
- ✅ 2.000 minutos/mês
- ✅ Unlimited para repos públicos

**Este workflow usa:**
- ~5 minutos por execução
- 2x ao dia = 10 min/dia = 300 min/mês
- **Totalmente dentro do free tier!**

### Otimização

Para economizar minutos:
1. Use cache de dependências (`cache: 'npm'`)
2. Execute apenas quando necessário
3. Reduza timeout desnecessário

---

## 📚 Recursos Adicionais

### Documentação

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Puppeteer Docs](https://pptr.dev/)
- [Cron Expression](https://crontab.guru)

### Exemplos de Workflows

Veja mais exemplos em:
- [Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)

### Comunidade

- [GitHub Discussions](https://github.com/marciocleydev/boot_aliexpress/discussions)
- [Issues](https://github.com/marciocleydev/boot_aliexpress/issues)

---

## 🎓 Próximos Passos

1. ✅ Configure os Secrets
2. ✅ Execute manualmente para testar
3. ✅ Verifique screenshots
4. ✅ Aguarde execução automática
5. ✅ Monitore resultados

**Dúvidas?** Abra uma [Issue](https://github.com/marciocleydev/boot_aliexpress/issues/new)!

---

## 📝 Changelog

### v2.0 (Atual)
- ✨ Múltiplos horários de execução
- ✨ Seleção de script via interface
- ✨ Job summary automático
- ✨ Artifacts com retenção de 7 dias
- 🐛 Fix: timeout aumentado para 15min

### v1.0 (Original)
- 🎉 Release inicial
- ⚙️ Execução diária às 10h UTC
- 📸 Upload de screenshots

---

**Feliz automação! 🪙🤖**
