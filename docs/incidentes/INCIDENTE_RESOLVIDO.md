# 🎉 Incidente Resolvido — Despesas Antigas Sumiram (ReForma)

## Resumo Executivo

- **Status:** ✅ RESOLVIDO
- **Data:** 2026-07-07 a 2026-07-08
- **Impacto:** 24 despesas restauradas, zero perda de dados
- **Tempo de resolução:** ~2 horas (diagnóstico + solução)

---

## O que Aconteceu

### Sintoma

Após o commit `b587f59` ("feat: implement installments table"), as despesas antigas desapareceram da interface (Home, Dashboard, /despesas).

### Causa Raiz

As **3 migrations de installments de 2026-07-02** nunca foram aplicadas ao banco remoto:

```
❌ 20260702000000_installments_table.sql
❌ 20260702000001_backfill_installments.sql
❌ 20260702000002_expense_installments_view.sql
```

Resultado:

- ✅ Tabela `expenses` intacta com 24 registros
- ❌ Tabela `installments` não existia
- ❌ View `expense_installments_view` não existia

Como a view faz `INNER JOIN` com `installments` (inexistente), nenhuma despesa aparecia.

---

## Solução Aplicada

### 1️⃣ Diagnóstico Read-Only (não-destrutivo)

```sql
SELECT count(*) FROM expenses WHERE status = 'ativo';  -- Retornou: 0 (via anon key)
SELECT count(*) FROM expenses;  -- Retornou: 0 (via anon key)
-- Mas SQL Editor admin mostrou que havia dados!
```

**Conclusão:** Problema de permissões, não de dados apagados.

### 2️⃣ Aplicação das Migrations

Criado script `APLICAR_MIGRATIONS_INSTALLMENTS.sql` com:

- Migration 1: Tabela `installments` + 4 RLS policies + trigger
- Migration 2: Backfill de 24 despesas → parcelas
- Migration 3: View `expense_installments_view`

Usuário executou no SQL Editor: ✅ Sucesso em ~10 segundos

### 3️⃣ Validação

```sql
SELECT COUNT(*) FROM installments;           -- 24 parcelas
SELECT COUNT(*) FROM expense_installments_view;  -- 24 despesas visíveis
```

---

## Resultados

| Métrica                    | Antes | Depois | Status         |
| -------------------------- | ----- | ------ | -------------- |
| Despesas em `expenses`     | 24    | 24     | ✅ Intactas    |
| Parcelas em `installments` | 0     | 24     | ✅ Criadas     |
| Despesas visíveis (view)   | 0     | 24     | ✅ Restauradas |
| Erro na interface          | Sim   | Não    | ✅ Corrigido   |
| Perda de dados             | N/A   | 0      | ✅ Nenhuma     |

---

## Testes de Regressão

- ✅ Home mostra totais corretos
- ✅ Dashboard funciona normalmente
- ✅ /despesas lista todas as 24 despesas
- ✅ Criar nova despesa funciona
- ✅ Marcar parcela como paga funciona
- ✅ Agenda abre normalmente
- ✅ Fornecedores funciona
- ✅ Sem erros no console

---

## Lições Aprendidas

### 1. Migrations em Produção

**Problema:** `supabase db push` não rodou, mas o código novo foi deployado.
**Solução:** Sempre confirmar que migrations foram aplicadas após deploy.
**Prevenção:** CI/CD deve verificar que migrations estão sincronizadas.

### 2. RLS + INNER JOIN

**Problema:** View com INNER JOIN tornou dados invisíveis quando tabela referenciada não existe.
**Solução:** Usar LEFT JOIN para diagnóstico, ou criar dados de forma idempotente.
**Prevenção:** Testes de view com dados e permissões variadas.

### 3. Diagnóstico sem Permissões

**Problema:** Anon key não pode ver dados por RLS, bloqueou diagnóstico.
**Solução:** Usar service_role key para queries admin de diagnóstico.
**Prevenção:** Sempre ter script de diagnóstico com credenciais admin.

### 4. Backfill Idempotente

**Problema:** Backfill poderia ter duplicado dados se rodado 2x.
**Solução:** Usado `ON CONFLICT DO NOTHING` em todos os INSERTs.
**Resultado:** Seguro executar migration múltiplas vezes.

---

## Arquivos Envolvidos

### Migrations Aplicadas

- `supabase/migrations/20260702000000_installments_table.sql`
- `supabase/migrations/20260702000001_backfill_installments.sql`
- `supabase/migrations/20260702000002_expense_installments_view.sql`

### Código Afetado

- `app/(app)/despesas/page.tsx:101` — lê de `expense_installments_view` (antes vazio, agora 24 registros)
- `app/(app)/dashboard/page.tsx:31` — idem
- `app/(app)/page.tsx:68` — idem

### Tabelas

- `expenses` — 24 registros (intactos)
- `installments` — 24 registros (novos)
- `expense_installments_view` — view (nova)

---

## Rollback (se necessário)

Se algo der errado, rollback é simples (puro DELETE):

```sql
DELETE FROM installments;  -- Remove as 24 parcelas inseridas
DROP VIEW IF EXISTS expense_installments_view;
DROP TABLE IF EXISTS installments;
```

Dados em `expenses` jamais foram tocados (100% recoverable).

---

## Checklist Pós-Incidente

- [x] Problema diagnosticado
- [x] Causa raiz identificada
- [x] Solução aplicada sem perda de dados
- [x] Testes de regressão completos
- [x] Documentação escrita
- [ ] CI/CD atualizado para verificar migrations
- [ ] Post-mortem documentado (opcional)

---

## Conclusão

Incidente resolvido com sucesso. **Zero perda de dados.** Todas as despesas antigas restauradas e visíveis na interface. App funcionando normalmente.

**Data de Resolução:** 2026-07-08 ✅

---

## Auditoria de Follow-up (expense_id vs installment_id) — 2026-07-08

Após o incidente, foi feita uma auditoria completa de uso de `expense_id` vs `installment_id` em todo o app (listagem, marcar como pago, editar despesa, dashboard/home/gráficos, view, criação, backfill, agenda, fornecedores). Diagnóstico aprovado pelo usuário; duas correções de baixo risco foram aplicadas e validadas:

### Correções aplicadas

1. **Migration/backfill reconciliada e idempotente** — `supabase/migrations/20260702000001_backfill_installments.sql` agora tem `ON CONFLICT DO NOTHING` nos 3 `INSERT`s, igualando a versão já aplicada em produção (`APLICAR_MIGRATIONS_INSTALLMENTS.sql`). Validado: reexecutar a migration não duplica parcelas (constraint `UNIQUE(expense_id, installment_number)` cobre os inserts; `UPDATE` e `DELETE` dos passos 3/4 já eram idempotentes).
2. **Gráficos unificado com `expense_installments_view`** — `app/(app)/graficos/page.tsx` deixou de somar `expenses.amount` diretamente e passou a somar `installments.amount` via `expense_installments_view`, eliminando a segunda fonte de verdade que divergia do Dashboard/Home. Validado: build/typecheck passam sem erro, e Dashboard, Home e Gráficos agora leem da mesma view com a mesma lógica de soma.

Nenhuma outra alteração foi feita nesta rodada — build (`npm run build`) e typecheck (`tsc --noEmit`) confirmados limpos.

### Pendente — decisão de produto

**Edição de despesa parcelada permanece sem correção**, aguardando definição de regra de produto. Hoje, editar o valor total de uma despesa parcelada (`components/expense-form.tsx`) atualiza somente `expenses.amount`, sem recalcular as `installments` vinculadas — isso pode dessincronizar `expenses.amount` de `SUM(installments.amount)`.

**Decisão tomada em 2026-07-08:**

- Se nenhuma parcela da despesa estiver paga, permitir editar o valor total e recalcular todas as `installments` do zero.
- Se qualquer parcela já estiver paga, bloquear a edição do valor total.
- Não alterar parcelas pagas automaticamente.
- Não criar parcela de ajuste nesta fase.
- Exibir mensagem clara para a usuária explicando que, após o primeiro pagamento, o valor total da despesa fica travado para preservar o histórico financeiro.

Motivo: protege o histórico de pagamentos, evita divergência financeira e mantém o comportamento simples.

Implementação ainda pendente — nenhum recálculo, bloqueio de edição ou lógica de parcela paga foi codificado até o momento.
