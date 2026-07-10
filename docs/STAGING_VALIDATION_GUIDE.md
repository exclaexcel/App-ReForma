# Staging Validation Guide — Installments Migration

**Branch:** `deploy/installments-migration`  
**Status:** ✅ Ready for staging/preview  
**Date:** 2026-07-02

---

## Quick Start

```bash
# 1. Checkout branch
git checkout deploy/installments-migration

# 2. Deploy to staging/preview (your usual flow)
# e.g., vercel --previewbuild or equivalent

# 3. Apply migrations to staging Supabase
npx supabase db push --linked  # or your staging method

# 4. Run tests below
```

---

## Test Plan (in order)

### Phase 1: Database & View Validation

**Location:** Supabase Console → SQL Editor

Run all tests from `docs/VALIDATION_TESTS.sql`:

1. ✅ Table structure verification
2. ✅ View columns validation
3. ✅ Index verification
4. ✅ RLS policy check

**Expected:** All queries return expected row counts/columns. No errors.

---

### Phase 2: Manual App Tests

#### Test 1: Single Payment (à vista)

```
1. Click "Lançar Despesa"
2. Amount: R$ 500,00
3. Parcelas: 1
4. Payment Method: PIX
5. Mark as paid: YES
6. Save

Expected:
- 1 line in expenses table (with amount = 500)
- 1 line in installments (installment_number=1, total_installments=1, amount=500)
- Dashboard shows: "Pago: R$ 500,00"
- List view shows: "Pago" badge
```

#### Test 2: 10 Installments of R$ 1.200,00

```
1. Click "Lançar Despesa"
2. Amount: R$ 1.200,00
3. Parcelas: 10
4. Payment Method: Cartão de Crédito
5. Mark as paid: NO
6. Save

Expected:
- 1 line in expenses (amount = 1200)
- 10 lines in installments:
  - All: expense_id same, installment_number 1-10, total_installments=10
  - All: amount = 120.00 each (sum = 1200.00 exactly)
  - All: status='pending', payment_method='cartao_credito'
  - due_date: 1st on today, 2nd on +1 month, ..., 10th on +9 months
- Dashboard shows: "A Pagar: R$ 1.200,00 · 10 despesas" (counts installments)
- List view shows: "Parcela 1/10", "Parcela 2/10", etc.
```

#### Test 3: 3 Installments of R$ 1.000,00

```
1. Click "Lançar Despesa"
2. Amount: R$ 1.000,00
3. Parcelas: 3
4. Payment Method: PIX
5. Mark as paid: NO
6. Save

Expected:
- 1 line in expenses (amount = 1000)
- 3 lines in installments:
  - amount = [333.34, 333.33, 333.33]
  - SUM(amount) = 1000.00 exactly
  - All status='pending', payment_method='pix'
- Dashboard shows: "A Pagar: R$ 1.000,00 · 3 despesas"
- List view shows: "Parcela 1/3", "Parcela 2/3", "Parcela 3/3"
```

**Verify in SQL (Supabase Console):**

```sql
SELECT installment_number, amount
FROM installments
WHERE expense_id = 'YOUR_EXPENSE_ID'
ORDER BY installment_number;

-- Expected:
-- | 1 | 333.34 |
-- | 2 | 333.33 |
-- | 3 | 333.33 |

SELECT SUM(amount) FROM installments WHERE expense_id = 'YOUR_EXPENSE_ID';
-- Expected: 1000.00
```

#### Test 4: Mark Installments 3 and 7 as Paid (from 10x test)

````
1. Open the "10x de R$ 1.200,00" despesa
2. Find "Parcela 3/10" → click "Marcar Pago"
3. Find "Parcela 7/10" → click "Marcar Pago"
4. Go back to list (or refresh)

Expected in UI:
- Parcela 3/10: "Pago" badge (green), status shows paid date
- Parcela 7/10: "Pago" badge (green)
- Parcelas 1,2,4,5,6,8,9,10: "A Pagar" badge (orange)
- Dashboard: "Pago: R$ 240,00 · Pendente: R$ 960,00"

Expected in DB:
```sql
SELECT installment_number, status, paid_at
FROM installments
WHERE expense_id = 'YOUR_10X_EXPENSE_ID'
ORDER BY installment_number;

-- | 1 | pending | NULL       |
-- | 2 | pending | NULL       |
-- | 3 | paid    | <timestamp>|
-- | 4 | pending | NULL       |
-- | 5 | pending | NULL       |
-- | 6 | pending | NULL       |
-- | 7 | paid    | <timestamp>|
-- | 8 | pending | NULL       |
-- | 9 | pending | NULL       |
-- | 10| pending | NULL       |
````

**Critical Check:** Only rows 3 and 7 changed. Others untouched. ✅

#### Test 5: Change Payment Method of One Installment

````
1. Open "10x de R$ 1.200,00" (from test 4)
2. Find "Parcela 5/10" → change payment method from "Cartão de Crédito" to "PIX"
3. Confirm

Expected in UI:
- Parcela 5/10: payment method dropdown shows "PIX"

Expected in DB:
```sql
SELECT installment_number, payment_method
FROM installments
WHERE expense_id = 'YOUR_10X_EXPENSE_ID'
ORDER BY installment_number;

-- | 1 | cartao_credito |
-- | 2 | cartao_credito |
-- | 3 | cartao_credito |
-- | 4 | cartao_credito |
-- | 5 | pix            | ← Only this changed
-- | 6 | cartao_credito |
-- | 7 | cartao_credito |
-- | 8 | cartao_credito |
-- | 9 | cartao_credito |
-- | 10| cartao_credito |
````

**Critical Check:** Only row 5 changed. Others untouched. ✅

---

### Phase 3: Dashboard Validation

#### Test 6: Dashboard Summary

Open **Home** page, expected to see:

```
Saldo Disponível: R$ [budget - 1200 - 1000 - 500 - ...]

Comprometido: R$ 2.700,00  (1200 + 1000 + 500)
A Pagar: R$ 2.460,00       (1200 + 1000 - 240 paid, 500 paid)

Últimas Despesas: 10 + 3 + 1 = 14 linhas (one per installment)
- 10x Parcela 3/10: R$ 120,00 Pago (green)
- 10x Parcela 7/10: R$ 120,00 Pago (green)
- 10x Parcelas 1,2,4,5,6,8,9,10: R$ 120,00 A Pagar (orange) [8 rows]
- 3x Parcelas 1,2,3: R$ 333.33, 333.33, 333.33 A Pagar [3 rows]
- 1x Parcela 1/1: R$ 500,00 Pago (green) [1 row]
```

**Visual check:**

- Paid (green checkmark) vs. Pending (orange clock) badges correct ✅
- Installment badges show "N/M" correctly ✅
- Amounts displayed correctly ✅

#### Test 7: Overdue Calculation

````
1. Create a test despesa with due_date = today - 10 days
2. Mark installments as pending (don't pay)

Expected in UI:
- Badge shows "Atrasado" (red alert icon) ✅
- Dashboard may highlight overdue section

Expected in view query:
```sql
SELECT installment_number, is_overdue, installment_status
FROM expense_installments_view
WHERE expense_id = 'YOUR_TEST_OVERDUE_EXPENSE'
  AND due_date < CURRENT_DATE;

-- | 1 | true | pending |  ← is_overdue = true because pending + date in past
-- | 2 | true | pending |
````

**Note:** `is_overdue` is calculated at query time, not stored. This is correct. ✅

#### Test 8: Monthly Cash Flow

Open **Dashboard**, look for monthly breakdown (if implemented):

```
Expected: Installments grouped by due_date month, showing:
- July 2026: R$ 120 + R$ 333.34 + ... (sum of all dues in July)
- August 2026: R$ 120 + R$ 333.33 + ... (sum of all dues in August)
- etc.
```

(This test is optional; depends on dashboard implementation.)

---

### Phase 4: Code Review Checklist

Before approving for production:

#### Payment Update Verification

```bash
# Grep for mass-updates by expense_id (should be ZERO hits)
grep -r "\.eq(\"expense_id\"" --include="*.tsx" --include="*.ts"
# Expected: no output (zero matches)
```

#### View Check

```sql
-- Verify security_invoker is set
SELECT schemaname, viewname, definition
FROM pg_views
WHERE viewname = 'expense_installments_view';

-- Definition should reference installments + expenses join
-- should_invoker setting should be on
```

#### Status Field Check

```sql
-- Verify status enum constraint
SELECT constraint_name, constraint_definition
FROM information_schema.table_constraints
WHERE table_name = 'installments' AND constraint_type = 'CHECK';

-- Should include: status IN ('pending', 'paid', 'overdue')
```

---

## Checklist: Before Approving for Production

- [ ] Phase 1 (DB/View): All queries pass
- [ ] Phase 2 (App Tests 1-5): All manual tests pass
- [ ] Phase 3 (Dashboard): Totals match, badges correct
- [ ] Phase 4 (Code Review): No mass-updates by expense_id, RLS confirmed
- [ ] No errors in browser console or server logs
- [ ] No database errors in Supabase logs
- [ ] Able to create, edit, and mark individual installments without affecting siblings
- [ ] Dashboard accurately reflects pago/pendente/vencido states
- [ ] CSV export includes "Parcela N/M" column
- [ ] Installment row component works (toggle paid/pending, change payment method)

---

## Common Issues & Fixes

### Issue: Dashboard showing duplicate totals

**Cause:** Query is summing expenses instead of installments  
**Fix:** Ensure queries use `expense_installments_view` or join to installments table

### Issue: Marking one installment paid marks others too

**Cause:** Update query using `expense_id` instead of `installment.id`  
**Fix:** Verify `installment-row.tsx` uses `.eq("id", installment.id)`

### Issue: Amounts don't sum to total

**Cause:** `splitAmountCentavos()` not used or rounding error  
**Fix:** Test `splitAmountCentavos(1000, 3)` manually in browser console

### Issue: Overdue indicator not showing

**Cause:** View calculation wrong or UI not checking `is_overdue`  
**Fix:** Verify view query and expense-list-item.tsx checks both `is_overdue` and `installment_status`

### Issue: RLS blocking queries

**Cause:** View or installments table missing `security_invoker = true`  
**Fix:** Re-run migration that sets `ALTER VIEW ... SET (security_invoker = true)`

---

## Approval Sign-Off

Once all tests pass:

```
✅ Staging Validation Complete
- Date: [date]
- Tester: [name]
- Branch: deploy/installments-migration
- Ready for: Production Deploy
```

Then merge to main and deploy to production per your usual process.

---

## Post-Production (1-2 weeks)

Once production is stable:

1. Schedule cleanup migration: `20260702000002_drop_legacy_installment_columns.sql`
2. This removes `installment_count`, `installment_number`, `parent_expense_id` from `expenses`
3. Run in off-peak hours
4. Verify zero impact (backward-compat columns already unused)

---

## Contact / Escalation

- **DB Issues:** Check Supabase logs, verify RLS policies
- **App Issues:** Check browser console, verify component imports
- **Data Issues:** Query directly in Supabase console
- **Rollback:** Revert code branch; DB remains intact with all old columns

Good luck! 🚀
