# Backlog de Pendências — App ReForma

**Gerado em:** 2026-06-24  
**Base:** documentos em `auditoria/` + inspeção de código (`2026-06-22-tech-lead-day1.md`, `2026-06-22-analise-nucleo-funcional.md`, `2026-06-23-relatorio-dia.md`)  
**Último marco entregue:** v0.5 — conciliação documental (commit `7e4f74f`, 2026-06-22)

---

## 🔴 CRÍTICO — Bloqueadores funcionais

- [ ] **#1 Agenda: editar e deletar eventos** — `schedule-view.tsx` é read-only; lógica já existe em `schedule-event-form.tsx` mas sem ponto de entrada na UI
- [ ] **#2 Telas brancas em falha de rede** — 4 módulos com `console.error` silencioso: `despesas/page.tsx:85`, `comprovantes/page.tsx:141`, `fornecedores/page.tsx:46`, `diario-obras/page.tsx:62`
- [ ] **#3 Middleware libera rotas protegidas em falha de rede** — `middleware.ts` tem fallback inseguro no `try/catch` do `getUser()`
- [ ] **#4 `catch {}` silencioso no server client** — `lib/supabase/server.ts` mascara falhas de sessão em Server Components

---

## 🟠 ALTO — Qualidade e confiabilidade

- [ ] **#5 Paginação ausente** — queries carregam todos os registros sem `limit`; degrada com >100 despesas
- [ ] **#6 Schema base não versionado** — não existe `000_initial_schema.sql`; impossível recriar banco do zero pelo repositório
- [ ] **#7 Migration 004 aplicada manualmente** — histórico local desincronizado; fix: `supabase migration repair --status applied 20260622120000`
- [ ] **#8 Tipos Supabase manuais** — `lib/types.ts` com casts forçados; mudança de schema quebra em runtime silenciosamente (setup: `supabase gen types typescript`)
- [ ] **#9 `start_date` não exibido** — campo existe no banco mas não aparece em nenhuma tela; "dias corridos de obra" é dado central
- [ ] **#10 `paid_at` não popula automaticamente** — campo criado na migration 004 mas precisa de trigger ou default
- [ ] **#11 Cancelamento apaga histórico** — não existe estado `cancelado`; delete destrói rastro contábil

---

## 🟡 MÉDIO — UX e robustez

- [ ] **#12 BottomNav não cobre 4 módulos** — Diário de Obras, Cômodos, Comprovantes e Fornecedores existem mas sem acesso direto pela nav inferior
- [ ] **#13 Delete em Cômodos sem confirmação** — único módulo sem `window.confirm`
- [ ] **#14 Projeto/Editar não redireciona após salvar** — exibe mensagem de sucesso estática sem navegar
- [ ] **#15 WhatsApp em Fornecedores sem validação** — sem máscara nem regex de formato
- [ ] **#16 `<img>` no lugar de `next/image`** — com `eslint-disable` em `expense-form.tsx:351` e `comprovantes/page.tsx:54`
- [ ] **#17 Budget inválido cria projeto com `total_budget = 0` sem aviso** — `create-first-project.tsx` usa `|| 0` silenciosamente
- [ ] **#18 Badge "sem comprovante" ausente na listagem** — `is_paid = true` com `receipt_url = null` não tem indicador visual em `expense-list-item.tsx`
- [ ] **#19 Filtro "pagos sem comprovante" não existe** — não há como listar rapidamente despesas pagas sem documento
- [ ] **#20 `sequence_order` em Tarefas sem UI** — campo existe no tipo e no banco, nunca populado no insert; ordenação manual não funciona

---

## 🔵 BAIXO — Dashboard e analytics

- [ ] **#21 Saldo explícito ausente no dashboard** — `orçamento - comprometido` não é calculado nem exibido como KPI
- [ ] **#22 Total por cômodo não existe** — `room_id` nas despesas nunca é agregado nos gráficos
- [ ] **#23 Total por fornecedor não existe** — nenhuma tela soma despesas por `supplier_id`
- [ ] **#24 Curva de investimento acumulado ausente** — gráfico mostra gasto por semana, não acumulado
- [ ] **#25 Export CSV desatualizado** — `expense_type`, `invoice_number` e demais campos da migration 004 fora do export
- [ ] **#26 Dashboard sem % de documentação completa**

---

## ⚪ FUTURE — Roadmap (sem data)

- [ ] **#27 Testes automatizados E2E** — Playwright instalado mas sem nenhum arquivo `e2e/`; fluxos mínimos: login, criar despesa, visualizar gráfico
- [ ] **#28 Agenda vinculada financeiramente** — `ScheduleEvent` sem `expense_id`, `category_id`, `room_id`
- [ ] **#29 OCR para leitura de NF** — extrair número e valor automaticamente da foto do cupom
- [ ] **#30 Relatório/exportação de tarefas por cômodo**
- [ ] **#31 Validação de CNPJ do fornecedor**
- [ ] **#32 Ativar Leaked Password Protection no Supabase Auth**
- [ ] **#33 Agrupamento mensal nos gráficos** (hoje apenas semanal)

---

## ❌ CANCELADO

- ~~Galeria Antes e Depois~~ — fora da proposta (decisão 2026-06-24)

---

## Resumo

| Prioridade | Qtd |
|---|---|
| 🔴 Crítico | 4 |
| 🟠 Alto | 7 |
| 🟡 Médio | 8 |
| 🔵 Baixo | 6 |
| ⚪ Future | 7 |
| ❌ Cancelado | 1 |
| **Total ativo** | **33** |
