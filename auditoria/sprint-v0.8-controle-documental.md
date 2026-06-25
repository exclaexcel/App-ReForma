# Sprint v0.8 — Controle Documental & Paginação

**Objetivo:** Implementar as 5 features que atacam a proposta principal do ReForma (documentação confiável de despesas) e resolver paginação de dados.

**Estimativa:** 10-14 horas de desenvolvimento  
**Data alvo:** 2026-06-25 a 2026-06-27  
**Status:** 🟡 Planejado

---

## 📋 Backlog Priorizado

### 🔴 Prioridade 1 — Bloqueadores funcionais (4-5h)

#### #5 — Paginação em despesas (+others)
**Criticidade:** Média | **Impacto:** >100 registros começam a desfazer a UI  
**Arquivos afetados:** `despesas/page.tsx`, `comprovantes/page.tsx`, `fornecedores/page.tsx`, `diario-obras/page.tsx`

**O que fazer:**
1. Adicionar `limit` e `offset` nas queries Supabase (10-20 por página)
2. Implementar "Ver mais" botão ou lazy-load no final da listagem
3. Manter scroll position ou padrão de UX claro

**Esforço:** 2-3h  
**Risco:** Baixo (padrão Supabase bem documentado)

---

#### #9 — Exibir `start_date` no dashboard
**Criticidade:** Média | **Impacto:** "Dias corridos de obra" é informação central do app  
**Arquivo afetado:** `dashboard/page.tsx`, `lib/types.ts`

**O que fazer:**
1. Ler `project.start_date` (já vem do banco)
2. Calcular `dias_decorridos = Math.floor((Date.now() - new Date(start_date)) / (1000*60*60*24))`
3. Exibir em card/banner: "Obra iniciada há X dias" ao lado do countdown
4. Se `start_date` for null, exibir placeholder "Data de início não definida"

**Esforço:** 30min  
**Risco:** Muito baixo (só leitura + UI simples)

---

#### #11 — Estado "cancelado" em vez de delete
**Criticidade:** Média-Alta | **Impacto:** Auditoria/histórico contábil  
**Arquivos afetados:** `lib/types.ts`, `components/expense-form.tsx`, `app/(app)/despesas/page.tsx`

**O que fazer:**
1. **Migration:** Adicionar coluna `status` em `expenses` com valores: `active | cancelado`
   - Default: `active`
   - Constraint: `CHECK (status IN ('active', 'cancelado'))`
2. **Tipo TypeScript:** Adicionar `status: 'active' | 'cancelado'` em `Expense`
3. **UI — Delete:** Em vez de deletar, atualizar status para `cancelado`
   - Toast: "Despesa cancelada"
   - Listagem: Filtrar apenas `status = 'active'` por default
4. **Botão "Restaurar":** Opcional — permitir voltar status de `cancelado` para `active`
5. **Auditoria:** Soft-delete permite rastrear o quê/quando foi cancelado

**Esforço:** 2h  
**Risco:** Médio (mudança de schema + lógica de filtro)

---

### 🟠 Prioridade 2 — Documentação visual (2-3h)

#### #18 — Badge "sem comprovante" na listagem
**Criticidade:** Média | **Impacto:** User vê rapidamente quais despesas estão documentadas  
**Arquivo afetado:** `components/expense-list-item.tsx`

**O que fazer:**
1. Ler campos: `is_paid`, `receipt_url`, `expense_type`, `invoice_url`, `invoice_value`, `amount`
2. Chamar função já existente `getDocStatus()` (criada em v0.5)
3. Exibir badge colorido baseado no status:
   - 🟢 Verde: `getDocStatus() === 'completo'` → "Documentado"
   - 🟡 Amarelo: `getDocStatus() === 'pendente'` → "Doc. incompleta"
   - 🔴 Vermelho: `getDocStatus() === 'divergencia'` → "Divergência"
   - ⚪ Cinza: `getDocStatus() === 'sem_regra'` → (sem badge)
4. Posicionar badge no canto superior direito do card

**Esforço:** 45min  
**Risco:** Muito baixo (função já existe)

---

#### #19 — Filtro "pagos sem comprovante"
**Criticidade:** Média | **Impacto:** Identificar falhas documentais rapidamente  
**Arquivos afetados:** `app/(app)/despesas/page.tsx`, `components/advanced-filters-modal.tsx`

**O que fazer:**
1. Adicionar checkbox novo em `advanced-filters-modal.tsx`:
   - Label: "Pagos sem comprovante"
   - Adiciona flag: `advancedFilters.paidWithoutReceipt = boolean`
2. Lógica de filtro em `despesas/page.tsx`:
   ```ts
   const matchPaidWithoutReceipt = 
     !advancedFilters.paidWithoutReceipt || 
     (e.is_paid && !e.receipt_url);
   ```
3. Incluir na condição global de filtro
4. Atualizar label do filtro na UI: mostrar quantas despesas combinam

**Esforço:** 1-1.5h  
**Risco:** Baixo (padrão de filtro já existe)

---

### 🔵 Prioridade 3 — Analytics (1-2h)

#### #21 — Saldo disponível no dashboard
**Criticidade:** Baixa | **Impacto:** KPI principal do app  
**Arquivo afetado:** `app/(app)/dashboard/page.tsx`

**O que fazer:**
1. Cálculo:
   ```ts
   saldo = project.total_budget - totalCommitted
   ```
2. Exibir como novo KPI card (após "Total Pago"):
   - Mostrar em verde se positivo, vermelho se negativo
   - Label: "Saldo disponível"
   - Valor: `formatCurrency(saldo)`
3. Se negativo, adicionar ⚠️: "Orçamento excedido em X"

**Esforço:** 30min  
**Risco:** Muito baixo

---

#### #22 — Total por cômodo (agregação)
**Criticidade:** Baixa | **Impacto:** User vê breakdown por ambiente  
**Arquivo afetado:** `app/(app)/graficos/page.tsx` ou novo componente

**O que fazer:**
1. Query: Agrupar `expenses` por `room_id`
   ```sql
   SELECT room_id, rooms.name, SUM(amount) as total
   FROM expenses
   GROUP BY room_id, rooms.name
   ```
2. Exibir em novo gráfico (Gráfico de Barras Horizontais já existe)
   - X-axis: Nome do cômodo
   - Y-axis: Total gasto
3. Ordenar decrescente

**Esforço:** 1h  
**Risco:** Baixo

---

#### #23 — Total por fornecedor
**Criticidade:** Baixa | **Impacto:** Identificar maiores fornecedores  
**Arquivo afetado:** `app/(app)/graficos/page.tsx`

**O que fazer:**
1. Query similar a #22, mas por `supplier_id`
2. Exibir como gráfico horizontal ou tabela
3. Mostrar também % do total

**Esforço:** 1h  
**Risco:** Baixo

---

## 🏗️ Arquitetura & Risco

### Mudanças no banco (Migration)
- 1 migration nova: `005_add_expense_status.sql`
- Adiciona coluna `status` em `expenses`
- Reversível: `DROP COLUMN status`
- **Não quebra queries existentes** (default behavior: filtrar por `status = 'active'`)

### Mudanças no código
- **0 quebras de contrato** em `lib/types.ts` (apenas ADD, não REMOVE)
- **0 mudanças em rotas existentes** (apenas filters são adicionados)
- **Reúso máximo** de componentes e funções já existentes

### Pontos de atenção
1. **RLS no banco:** Certifique que `status` column respeita RLS (usuários só veem suas despesas)
2. **Filtros padrão:** Sempre filtrar `status = 'active'` nas queries, exceto em telas de auditoria
3. **Backup:** Fazer dump do banco antes de rodar migration em prod

---

## 📊 Estimativa de Esforço

| Item | Esforço | Total |
|------|---------|-------|
| #5 Paginação | 2-3h | 3h |
| #9 start_date | 0.5h | 0.5h |
| #11 Estado cancelado | 2h | 2h |
| #18 Badge | 0.75h | 0.75h |
| #19 Filtro | 1-1.5h | 1.5h |
| #21 Saldo | 0.5h | 0.5h |
| #22 Por cômodo | 1h | 1h |
| #23 Por fornecedor | 1h | 1h |
| **Total** | — | **10h** |

**Buffers não inclusos** (20%): ~2h → **Total realista: 12h**

---

## ✅ Checklist de Execução

### Antes de começar
- [ ] Pull latest `main`
- [ ] Ler spec completa de Paginação em Supabase
- [ ] Fazer backup do banco em produção (Supabase Dashboard)

### Durante
- [ ] Criar migration 005
- [ ] Testar migration em dev
- [ ] Atualizar `lib/types.ts`
- [ ] Implementar paginação em 4 páginas
- [ ] Testar com >50 registros
- [ ] Adicionar `start_date` ao dashboard
- [ ] Implementar soft-delete
- [ ] Adicionar badge em `expense-list-item.tsx`
- [ ] Adicionar filtro "sem comprovante"
- [ ] Adicionar KPIs no dashboard
- [ ] Build sem erros
- [ ] Testar em dev server
- [ ] Commit + push

### Depois
- [ ] Monitorar Vercel deploy
- [ ] Testar em produção com dados reais
- [ ] Coletar feedback de UX

---

## 📝 Notas de Implementação

### Paginação — Padrão
```ts
const [page, setPage] = useState(0);
const pageSize = 20;

const { data, error } = await supabase
  .from("expenses")
  .select("*")
  .eq("project_id", projectId)
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order("created_at", { ascending: false });
```

### Soft-delete — Padrão
```ts
// DELETE
const { error } = await supabase
  .from("expenses")
  .update({ status: 'cancelado' })
  .eq("id", expenseId);

// FILTER (todas as queries)
.eq("status", "active")
```

### Badge — Reutilizar `getDocStatus()`
```ts
const status = getDocStatus(expense);
// Já retorna: "completo" | "pendente" | "divergencia" | "sem_regra"
```

---

## 🎯 Próximos Passos Após v0.8

1. **v0.9** — Refinamentos & Edge cases
   - #1 Agenda (editar/deletar)
   - #13 Delete em Cômodos (sem confirmação)
   - #14 Redirect em Projeto/Editar
   - #15 Validação WhatsApp

2. **v1.0** — Testes & Produção
   - #27 E2E tests com Playwright
   - Audit de segurança completa
   - Suporte multi-usuário/teams

3. **v1.1+** — Roadmap de longo prazo
   - #29 OCR para NF
   - #28 Agenda + Despesas
   - #31 Validação CNPJ

---

**Autor:** Claude Haiku 4.5  
**Data:** 2026-06-24  
**Versão:** 1.0
