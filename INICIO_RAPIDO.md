# 🚀 Guia Rápido de Início

## ⚡ Setup em 5 Minutos

### Opção 1: GitHub Actions (Recomendado - Totalmente Automático)

**Passo 1:** Configure os Secrets
```
1. Vá para: Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione:
   - Nome: ALIEXPRESS_EMAIL
   - Valor: seu-email@exemplo.com
   
   - Nome: ALIEXPRESS_PASSWORD  
   - Valor: sua_senha
```

**Passo 2:** Ative o Workflow
```
1. Vá para: Actions
2. Se aparecer mensagem, clique em "I understand my workflows"
3. Pronto! Vai executar automaticamente 2x ao dia
```

**Passo 3:** Teste Manualmente (Opcional)
```
1. Actions → "🪙 Resgatar Moedas AliExpress"
2. Run workflow → Run workflow
3. Aguarde 1-2 minutos
4. Baixe screenshots em "Artifacts"
```

✅ **Feito! Agora é automático!**

---

### Opção 2: Extensão de Navegador (Uso Manual/Complementar)

**Passo 1:** Instalar
```
1. Chrome: chrome://extensions/
2. Edge: edge://extensions/
3. Ativar "Modo desenvolvedor"
4. "Carregar sem compactação"
5. Selecionar pasta: /aliexpress
```

**Passo 2:** Fazer Login
```
1. Abra: https://www.aliexpress.com
2. Faça login normalmente
3. A extensão detecta automaticamente
```

**Passo 3:** Configurar (Opcional)
```
1. Clique no ícone da extensão
2. Configure preferências no popup
3. Pronto!
```

✅ **A extensão vai coletar moedas automaticamente!**

---

## 📖 Documentação Completa

Criamos 5 documentos detalhados para você:

| Arquivo | Conteúdo |
|---------|----------|
| **README.md** | Visão geral completa, comparação das soluções |
| **RESPOSTA_COMPLETA.md** | Resposta direta à sua pergunta (COMECE AQUI!) |
| **ANALISE_LOGICA.md** | Análise técnica detalhada da lógica |
| **ARQUITETURA.md** | Diagramas visuais da arquitetura |
| **GITHUB_ACTIONS_SETUP.md** | Guia completo de configuração |

### 🎯 Por Onde Começar?

1. **Apenas quer entender a lógica?**
   → Leia: `RESPOSTA_COMPLETA.md` (6 páginas)

2. **Quer usar GitHub Actions?**
   → Leia: `GITHUB_ACTIONS_SETUP.md` + configure secrets

3. **Quer entender tudo tecnicamente?**
   → Leia: `README.md` → `ANALISE_LOGICA.md` → `ARQUITETURA.md`

4. **Quer começar AGORA?**
   → Configure secrets → Vá em Actions → Run workflow

---

## 🔍 Resumo Ultra-Rápido

### O que a Extensão Faz?

```javascript
// Service Worker agenda tarefa diária
chrome.alarms.create('coins', {periodInMinutes: 1440});

// Content Script clica nos botões
document.querySelectorAll('.coin-task-claim').forEach(btn => {
  if (btn.offsetWidth > 0) btn.click();
});
```

### O que o GitHub Actions Faz?

```yaml
# Agenda execução (2h e 14h UTC)
schedule:
  - cron: '0 2,14 * * *'

# Executa script
run: |
  npm install puppeteer
  node scripts/automate-coins.js
```

### Qual a Diferença?

- **Extensão:** Executa no seu navegador Chrome/Edge
- **GitHub Actions:** Executa na nuvem do GitHub

### Qual Usar?

- **Só GitHub Actions:** Automação 100% automática
- **Só Extensão:** Não quer compartilhar credenciais
- **Ambos:** Máxima confiabilidade (RECOMENDADO!)

---

## ⚙️ Configurações Úteis

### Mudar Horário de Execução

Edite `.github/workflows/aliexpress-coins.yml`:

```yaml
schedule:
  - cron: '0 6,18 * * *'  # 6h e 18h UTC
  - cron: '0 */6 * * *'   # A cada 6 horas
  - cron: '0 9 * * 1-5'   # Dias úteis às 9h
```

Use https://crontab.guru para testar horários.

### Executar Manualmente

```
Actions → Workflow → Run workflow → Escolher script → Run
```

Opções:
- `script-basico.js` - Sem login (teste)
- `login-focado.js` - Com login simples
- `automate-coins.js` - Completo com stealth mode

### Ver Resultados

```
Actions → Última execução → Baixar "screenshots-XXX"
```

Screenshots gerados:
- `1-pagina-inicial.png`
- `2-pos-login.png`
- `3-pagina-moedas.png`
- `5-resultado-final.png`

---

## 🐛 Problemas Comuns

### "Workflow não executa"
✅ Vá em Settings → Actions → Verificar se está habilitado

### "Login falha"
✅ Verifique se os Secrets estão corretos
✅ Tente o `script-basico.js` que não precisa de login

### "Não encontra botões"
✅ Moedas já foram coletadas hoje
✅ Aguarde até amanhã
✅ Verifique screenshots para debug

### "Extension não funciona"
✅ Certifique-se que está logado no AliExpress
✅ Recarregue a extensão
✅ Verifique console do navegador (F12)

---

## 📊 Monitoramento

### Ver Logs GitHub Actions

```
Actions → Execução → Expandir steps
```

Log de sucesso:
```
🚀 Iniciando automação...
✅ Página carregada
🪙 Acessando moedas...
🎯 3 botões clicados
🎉 Automação concluída!
```

### Ver Status da Extensão

```
Clique no ícone → Ver popup → Status de moedas
```

---

## 💡 Dicas Pro

1. **Use ambos em conjunto:**
   - GitHub Actions: 2h e 14h UTC
   - Extensão: Coletas manuais extras

2. **Monitore regularmente:**
   - Verifique Actions 1x por semana
   - Baixe screenshots para debug

3. **Mantenha atualizado:**
   - AliExpress muda layout frequentemente
   - Atualize seletores se necessário

4. **Segurança:**
   - Nunca commite senhas no código
   - Use apenas GitHub Secrets
   - Rotacione senhas periodicamente

---

## 🎓 Próximos Passos

### Iniciante?
1. ✅ Configure GitHub Actions (5 min)
2. ✅ Execute manualmente para testar
3. ✅ Aguarde execução automática amanhã
4. ✅ Instale extensão para uso complementar

### Avançado?
1. ✅ Leia documentação técnica completa
2. ✅ Customize horários e scripts
3. ✅ Configure múltiplas contas
4. ✅ Adicione notificações (Telegram/Discord)
5. ✅ Contribua com melhorias

---

## 📞 Precisa de Ajuda?

- **Documentação:** Leia os 5 arquivos .md criados
- **Issues:** Abra uma issue no GitHub
- **Dúvidas:** Consulte GITHUB_ACTIONS_SETUP.md

---

## ✨ Recursos Criados

✅ 5 documentos markdown completos (60+ páginas)
✅ Workflow GitHub Actions aprimorado
✅ Scripts Puppeteer prontos para uso
✅ Extensão Chrome/Edge funcional
✅ Guias de configuração passo a passo
✅ Diagramas de arquitetura
✅ Exemplos de código
✅ Troubleshooting completo

**Tudo que você precisa está aqui! 🎉**

---

**Feliz automação! 🪙🤖**

*Criado com ❤️ para automatizar sua coleta de moedas do AliExpress*
