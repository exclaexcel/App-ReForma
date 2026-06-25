# Sprint Roadmap — App ReForma

**Estado atual:** v0.7 (Confiabilidade Crítica) ✅ Completo  
**Última atualização:** 2026-06-24

---

## 🚀 Próximo Sprint: v0.8 (2026-06-25 a 2026-06-27)

### Objetivo
Implementar 8 features que completam o núcleo funcional do ReForma: **controle documentado de despesas + paginação para escalabilidade**.

### Resultado esperado
- ✅ App escalável para >100 despesas (paginação)
- ✅ Usuário vê "dias corridos de obra" (start_date)
- ✅ Histórico contábil preservado (soft-delete)
- ✅ Visibilidade de documentação incompleta (badge + filtro)
- ✅ Dashboard com saldo e analytics básicas

### Estimativa
**12h total** (10h desenvolvimento + 2h testes/deploy)

---

## 📋 Features por Prioridade

### 🔴 P1 — Bloqueadores (4h)

| # | Feature | Esforço | Impacto |
|---|---------|---------|--------|
| #5 | Paginação em 4 listagens | 2-3h | Escalabilidade crítica |
| #9 | Exibir `start_date` | 30min | Informação central |
| #11 | Soft-delete com status | 2h | Auditoria/rastreabilidade |

**Documentação:** `sprint-v0.8-controle-documental.md` seções "Prioridade 1"

---

### 🟠 P2 — Documentação (2.5h)

| # | Feature | Esforço | Impacto |
|---|---------|---------|--------|
| #18 | Badge "sem comprovante" | 45min | UX visual |
| #19 | Filtro "pagos sem comprovante" | 1-1.5h | Identificar falhas |

**Documentação:** `sprint-v0.8-controle-documental.md` seções "Prioridade 2"

---

### 🔵 P3 — Analytics (2h)

| # | Feature | Esforço | Impacto |
|---|---------|---------|--------|
| #21 | Saldo disponível (KPI) | 30min | Dashboard completo |
| #22 | Total por cômodo | 1h | Breakdown de gastos |
| #23 | Total por fornecedor | 1h | Análise de fornecedores |

**Documentação:** `sprint-v0.8-controle-documental.md` seções "Prioridade 3"

---

## 📚 Como Começar

### Pré-requisitos
1. Ler `auditoria/sprint-v0.8-controle-documental.md` (visão completa)
2. Ler `auditoria/implementacao-v0.8-snippets.md` (código pronto)
3. Backup do banco em produção (Supabase Dashboard → Settings → Backups)

### Fluxo recomendado
1. Começar por #9 (30min, menor risco)
2. Fazer #5 em paralelo em 4 arquivos
3. Depois #11 (requer migration + testes)
4. #18 e #19 em paralelo
5. #21, #22, #23 juntas

### Comandos úteis
```bash
# Criar nova feature branch (opcional)
git checkout -b feat/v0.8-controle-documental

# Depois de implementar tudo:
git add -A
git commit -m "feat: v0.8 — paginação, start_date, soft-delete, documentação"
git push origin main

# Deploy para Vercel (automático com push a main)
```

---

## 🔍 Validation Checklist

Após implementar cada feature, validar:

- [ ] #5 Paginação
  - [ ] Query tem `range()`
  - [ ] Botão "Ver mais" aparece
  - [ ] Testado com >50 registros
  - [ ] Aplicado em 4 páginas

- [ ] #9 start_date
  - [ ] Valor lido do DB
  - [ ] Cálculo de dias corretos
  - [ ] UI exibe corretamente
  - [ ] Null-safe (se start_date não existe)

- [ ] #11 Soft-delete
  - [ ] Migration aplicada
  - [ ] Coluna `status` criada
  - [ ] Tipo `Expense` atualizado
  - [ ] Queries filtram `status = 'active'`
  - [ ] UI não mostra despesas canceladas

- [ ] #18 Badge
  - [ ] Função `getDocStatus()` chamada
  - [ ] Badge exibido corretamente
  - [ ] 4 estados visuais (verde, amarelo, vermelho, cinza)
  - [ ] Testado com vários tipos de despesa

- [ ] #19 Filtro
  - [ ] Checkbox em modal de filtros
  - [ ] Lógica de filtro funciona
  - [ ] Pode ser combinado com outros filtros
  - [ ] Label mostra count

- [ ] #21 Saldo
  - [ ] Cálculo correto
  - [ ] Exibido como KPI
  - [ ] Cor muda (verde/vermelho)
  - [ ] Aviso se negativo

- [ ] #22 e #23 Analytics
  - [ ] Dados agregados corretamente
  - [ ] Gráficos renderizam
  - [ ] Ordenação decrescente
  - [ ] Valores formatados

---

## 🚨 Riscos & Mitigação

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Migration falha em prod | Baixa | Testar em dev, backup antes, rollback plan |
| Paginação quebra filtros | Média | Testar combinações de filtros |
| Soft-delete com RLS | Baixa | RLS automático (protege por project_id) |
| Performance queries | Baixa | Usar `limit`, evitar N+1, índices criados |

---

## 📊 Roadmap Visual

```
v0.5 (2026-06-22)     v0.6 (2026-06-24)     v0.7 (2026-06-24)     v0.8 (2026-06-25)
Conciliação            Melhorias UX          Confiabilidade        Documentação + Dados
Documental             (7 itens)             (3 bloqueadores)      (8 itens)
✅ Completo            ✅ Completo           ✅ Completo            🟡 Em Planejamento
  - Tipos de                - Confirmação      - Middleware seguro    - Paginação
    despesa                - Toasts           - Logging              - start_date
  - Badge status           - Redirects        - Erro visual          - Soft-delete
  - Filtro                 - Empty states     - Badge/Filtro
    avançado               - BottomNav          replicado
                          - Aria-labels
                          - Touch targets

v0.9 (Future)         v1.0 (Future)         v1.1+ (Future)
Refinamentos          Testes & Produção     Roadmap Longo
(4 itens)             (E2E + Audit)         (OCR, Integração)
```

---

## 📞 Support & Questions

**Se tiver dúvidas sobre alguma feature:**
1. Verificar seção correspondente em `sprint-v0.8-controle-documental.md`
2. Checar snippets de código em `implementacao-v0.8-snippets.md`
3. Consultar backlog-pendencias.md para contexto histórico

**Se encontrar bloqueador:**
- Comunicar via commit message (com `[BLOCKER]` prefix)
- Ou marcar como issue no GitHub

---

**Criado:** 2026-06-24  
**Válido até:** Início de v0.9  
**Mantido por:** Claude Haiku 4.5
