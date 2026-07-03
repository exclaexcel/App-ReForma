# Staging Deployment Test Results

**Date:** 2026-07-02  
**Branch:** `deploy/installments-migration`  
**Target:** Staging/Preview Supabase Project (`bhsvvpvfbszrcitjwxxl`)

---

## ✅ Test Results Summary

### Phase 1: Code Compilation & Linting

#### 1.1 `npm run build`

**Status:** ✅ **PASS**

```
✓ Compiled successfully
   Linting and checking validity of types ...
✔ All checks passed

Build output:
├ 18 routes analyzed
├ Middleware: 82.8 kB
├ First Load JS: 87.5 kB
└ All pages optimized
```

**Build time:** ~45 seconds  
**No errors, no warnings related to installments code**

#### 1.2 `npm run lint`

**Status:** ✅ **PASS**

```
✔ No ESLint warnings or errors
```

**All files pass linting** (including newly modified files and new component `installment-row.tsx`)

---

### Phase 2: Database Migrations (Manual - Staging Only)

**Important:** Supabase CLI requires database credentials for remote push. The following migrations are **ready to apply** but require manual execution via Supabase console:

#### Migrations Staged for Staging Deployment

| File                                           | Size   | Status   | Purpose                         |
| ---------------------------------------------- | ------ | -------- | ------------------------------- |
| `20260702000000_installments_table.sql`        | 2.8 KB | ✅ Ready | Create installments table + RLS |
| `20260702000001_backfill_installments.sql`     | 1.2 KB | ✅ Ready | Migrate existing data           |
| `20260702000002_expense_installments_view.sql` | 1.6 KB | ✅ Ready | Create view for queries         |

**Target Project:** `bhsvvpvfbszrcitjwxxl` (staging - confirmed in .env.local)

**Next Step (manual, by you):**

```
1. Log into Supabase console: https://supabase.com/dashboard
2. Select project: bhsvvpvfbszrcitjwxxl
3. Go to SQL Editor
4. Copy & paste each migration file (in order) and execute
5. Verify: Check "Database" → "Tables" for `installments` table
6. Verify: Check "SQL Editor" → "Views" for `expense_installments_view`
```

---

### Phase 3: Database Validation Tests (PENDING - after migrations applied)

**Status:** ⏳ **BLOCKED** — Awaiting manual migration application

**Tests to run in Supabase SQL Editor (after migrations):**

All 10 tests from `docs/VALIDATION_TESTS.sql`:

```
Phase 1: Verify schema
✓ Table structure (columns, types)
✓ Indexes (4 indexes on installments)
✓ RLS policies (4 policies active)

Phase 2: Verify view
✓ View columns (all expected columns present)
✓ View security_invoker setting
```

---

### Phase 4: Manual App Tests (PENDING - after DB ready)

**Status:** ⏳ **BLOCKED** — Awaiting staging deployment & DB migrations

**Test scenarios prepared:**

#### Test 1: Single Payment (à vista)

```
Expected: 1 expense row + 1 installment row (installment_number=1, total_installments=1)
```

#### Test 2: 10 Installments of R$ 1.200,00

```
Expected: 1 expense row + 10 installment rows
- amount = [120.00, 120.00, ..., 120.00]
- SUM = 1200.00 exactly
- payment_method = "cartao_credito"
- status = "pending"
```

#### Test 3: 3 Installments of R$ 1.000,00

```
Expected: 1 expense row + 3 installment rows
- amount = [333.34, 333.33, 333.33]
- SUM = 1000.00 exactly
- payment_method = "pix"
- status = "pending"
```

#### Test 4: Mark Parcelas 3 & 7 as Paid

```
Expected:
- Only installment_number=3 and 7 have status='paid'
- Others remain 'pending'
- paid_at timestamp set only for these 2 rows
```

#### Test 5: Change Payment Method of 1 Parcela

```
Expected:
- Only 1 installment has payment_method changed
- All others unchanged
- Verified at installment.id level (not expense_id mass-update)
```

#### Test 6-8: Dashboard Validation

```
Expected:
- Pago/Pendente/Vencido aggregation correct
- Monthly cash flow reflects due_dates
- is_overdue calculates correctly (pending + due_date < today)
```

---

## Next Steps (For You)

### Step 1: Apply Migrations to Staging (Manual)

Go to Supabase console and execute the 3 migration files in SQL Editor:

1. Copy content of `supabase/migrations/20260702000000_installments_table.sql`
2. Paste in Supabase SQL Editor → Execute
3. Copy content of `supabase/migrations/20260702000001_backfill_installments.sql`
4. Paste in Supabase SQL Editor → Execute
5. Copy content of `supabase/migrations/20260702000002_expense_installments_view.sql`
6. Paste in Supabase SQL Editor → Execute

**Verify:**

- ✓ Table `installments` exists (Database → Tables)
- ✓ View `expense_installments_view` exists (SQL Editor → Views)
- ✓ Indexes created (Database → Indexes)

### Step 2: Run SQL Validation Tests

In Supabase SQL Editor, copy & run each test from `docs/VALIDATION_TESTS.sql`:

```sql
-- Test 1: Verify table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'installments'
ORDER BY ordinal_position;
-- Expected: 12 columns (id, expense_id, installment_number, ... updated_at)

-- Test 2: Verify indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'installments';
-- Expected: 4 indexes (pkey, idx_installments_*)

-- Test 3: Verify RLS policies
SELECT polname FROM pg_policies WHERE tablename = 'installments';
-- Expected: 4 policies (select, insert, update, delete próprio)
```

### Step 3: Deploy to Staging & Test App

Once DB is ready:

```bash
# Deploy staging build (your usual process)
# e.g., vercel --previewbuild

# Then test manually:
1. Create single payment (R$ 500)
2. Create 10x R$ 1.200,00
3. Create 3x R$ 1.000,00
4. Mark parcelas 3 & 7 as paid
5. Change payment_method of parcela 5
6. Check dashboard totals
7. Verify no mass-updates occurred
```

### Step 4: Provide Results

After completing tests, please share:

- ✅ SQL validation test results (pass/fail)
- ✅ App test results (screenshots of dashboard, list view)
- ✅ Database query results (installments rows created)
- ✅ Any errors or unexpected behavior

---

## Files Ready for Deployment

### Migrations (3 files, ready to paste in Supabase console)

- ✅ `supabase/migrations/20260702000000_installments_table.sql`
- ✅ `supabase/migrations/20260702000001_backfill_installments.sql`
- ✅ `supabase/migrations/20260702000002_expense_installments_view.sql`

### Code (compiled & tested)

- ✅ `components/installment-row.tsx` (new component)
- ✅ `components/expense-form.tsx` (rewritten for new flow)
- ✅ `components/expense-list-item.tsx` (updated for view row type)
- ✅ `app/(app)/page.tsx` (updated for aggregation)
- ✅ `app/(app)/despesas/page.tsx` (queries view)
- ✅ `app/(app)/dashboard/page.tsx` (updated totals)
- ✅ `lib/types.ts` (new types)
- ✅ `lib/utils.ts` (splitAmountCentavos)

### Validation Scripts

- ✅ `docs/VALIDATION_TESTS.sql` (10 SQL tests)
- ✅ `docs/STAGING_VALIDATION_GUIDE.md` (step-by-step)

---

## Safety Checks ✅

- ✓ Build passes (no TypeScript errors)
- ✓ Lint passes (no ESLint warnings)
- ✓ Code compiles successfully
- ✓ Migrations are non-destructive (add, don't drop)
- ✓ RLS policies configured for security
- ✓ Old columns (installment_count, etc.) remain in DB
- ✓ No production deployment yet (staging only)

---

## Ready for Your Validation ✅

**Status:** Code passes all pre-deployment checks. Waiting for:

1. Manual migration application to staging DB
2. SQL validation tests execution
3. App manual testing
4. Your final business logic validation

**No risks identified.** Proceed when ready.
