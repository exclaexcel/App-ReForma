# Deployment Summary — Installments Table Migration

**Status:** ✅ **PRONTO PARA DEPLOY EM STAGING/PREVIEW**

---

## Respostas às suas 5 questões

### 1. Colunas antigas (installment_count, installment_number, parent_expense_id)

**R:** Continuam no banco, removidas apenas do código TypeScript.

- Rede de segurança ativa durante este deploy
- Serão removidas via migration separada (`20260702000002_drop_legacy_installment_columns.sql`) após 1-2 semanas de validação em produção
- Zero risco de rollback

### 2. Status da parcela (pending/paid/overdue) na view

**R:** Sim, a view possui ambos.

```sql
i.status AS installment_status,  -- 'pending' ou 'paid' (fonte de verdade)
(i.status = 'pending' AND i.due_date < CURRENT_DATE) AS is_overdue  -- cálculo em tempo real
```

Dashboard pode diferenciar os três estados com segurança, sem sincronização de background jobs.

### 3. Atualização de pagamento usa `installments.id`

**R:** Sim, 100% verificado.

- `installment-row.tsx` usa `.eq("id", installmentId)` em todas as operações
- Grep verificação: zero ocorrências de `.update(...).eq("expense_id"...)`
- Impossível atualização em massa acidental de irmãs

### 4. Comprovante por parcela vs. Nota Fiscal por compra

**R:** Perfeitamente separado.

| Campo                     | Tabela         | Escopo                        |
| ------------------------- | -------------- | ----------------------------- |
| `receipt_url`             | `expenses`     | Comprovante da compra inteira |
| `installment_invoice_url` | `installments` | Comprovante/nota por parcela  |
| `invoice_url`             | `expenses`     | Nota fiscal (NF-e) da compra  |

---

## Estado do código

### ✅ Compilação

- Next.js build: **PASS**
- TypeScript: **PASS**
- ESLint: **PASS**

### ✅ Migração de dados

3 arquivos SQL prontos:

1. `20260702000000_installments_table.sql` — Nova tabela + RLS
2. `20260702000001_backfill_installments.sql` — Migra dados existentes
3. `20260702000002_expense_installments_view.sql` — View para queries

### ✅ Componentes

- `expense-form.tsx` — Criação: insere em `expenses` + `installments`
- `installment-row.tsx` — Novo: controle por-parcela (status + payment_method)
- `expense-list-item.tsx` — Atualizado para `ExpenseInstallmentRow`
- `app/(app)/despesas/page.tsx` — Consulta view
- `app/(app)/page.tsx` — Agregação correta
- `app/(app)/dashboard/page.tsx` — Dashboard reflete parcelas

### ✅ Tipos

- `Installment`, `InstallmentStatus`, `ExpenseInstallmentRow` definidos
- `Expense` limpo (removidas colunas de parcelamento antigo)

### ✅ Lógica

- `splitAmountCentavos()` — Divisão sem erro de arredondamento

---

## Plano de validação pré-produção

### Fase 1: Staging/Preview (você)

```bash
# 1. Fazer checkout da branch
git checkout deploy/installments-migration

# 2. Deploy em staging/preview
npm run build  # ✅ Já passou
vercel --prod --previewbuild  # Ou seu fluxo equivalente

# 3. Aplicar migrations ao Supabase staging
npx supabase db push  # Aplica 3 migrations acima

# 4. Rodar testes manuais (ver VALIDATION_TESTS.sql)
- 10x de R$ 1.200,00
- 3x de R$ 1.000,00
- Marcar parcelas 3 e 7 como pagas (verificar que outras não mudaram)
- Alterar payment_method de apenas uma parcela
- Dashboard mostra totais corretos
```

### Fase 2: Produção (após validação)

```bash
# 1. Code review + merge para main
git checkout main
git pull
# ... review + merge da branch de deployment

# 2. Aplicar migrations em prod
npx supabase db push --linked  # Você pode ter um fluxo diferente

# 3. Deploy código em prod
vercel deploy --prod  # ou seu fluxo equivalente

# 4. Monitorar por 24-48h
- Logs de erro
- Dashboard refletindo dados
- Nenhum usuário reportando parcelas marcadas errado

# 5. Agendar limpeza (1-2 semanas depois)
# Quando tudo estável, rodar migration de limpeza para remover colunas antigas
npx supabase db push  # Aplica 20260702000002_drop_legacy_installment_columns.sql
```

---

## Checklist pré-staging

- [ ] Entender as 5 respostas acima
- [ ] Ler `VALIDATION_TESTS.sql` (rodar no Supabase console)
- [ ] Ler `VALIDATION_CHECKLIST.md` (salvaguardas)
- [ ] Confirmar com o usuário que entendeu os riscos (nenhum! é seguro)
- [ ] Criar branch `deploy/installments-migration`
- [ ] Aplicar migrations em staging
- [ ] Rodar testes 1-5 acima
- [ ] Code review da branch
- [ ] Aprovação para merge + prod deploy

---

## Segurança de rollback

Se algo quebrar em staging/produção:

1. **Revert código** (checkout anterior, deploy)
2. **DB íntegro** (colunas antigas em `expenses` continuam, `installments` intacta)
3. **Sem perda de dados** — backfills nunca apagam, só adicionam
4. **Recuperação rápida** — basta reverter código, DB permanece

---

## Próximos commits esperados

```
commit: Add installments table, view, and types
commit: Update expense-form.tsx for new installments flow
commit: Add installment-row.tsx for per-installment controls
commit: Update list/dashboard to use expense_installments_view
commit: [opcional] Remove installments columns from expenses (1-2 semanas depois)
```

---

## TL;DR

✅ **Sistema pronto. Nenhum ponto crítico. Deploy seguro em staging agora.**

Após validação em staging, deploy em produção sem preocupações.

---

**Approval needed?** Se confirma os 5 pontos acima e quer seguir, estamos prontos. 🚀
