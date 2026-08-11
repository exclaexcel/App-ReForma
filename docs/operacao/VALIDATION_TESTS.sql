-- ============================================================================
-- VALIDATION TESTS FOR INSTALLMENTS MIGRATION
-- Run these queries in Supabase Console AFTER applying migrations
-- Environment: staging/preview branch (NOT production yet)
-- ============================================================================

-- ============================================================================
-- TEST 1: Verify table structure and RLS
-- ============================================================================

-- Check installments table exists with correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'installments'
ORDER BY ordinal_position;

-- Expected columns: id, expense_id, installment_number, total_installments,
-- amount, due_date, status, payment_method, paid_at, invoice_url, created_at, updated_at

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'installments'
ORDER BY indexname;

-- Expected indexes: installments_pkey, idx_installments_expense_id,
-- idx_installments_due_date, idx_installments_status, idx_installments_expense_status

-- ============================================================================
-- TEST 2: Verify view exists with correct columns
-- ============================================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'expense_installments_view'
ORDER BY ordinal_position;

-- Expected: installment_id, expense_id, installment_number, total_installments,
-- amount, due_date, installment_status, payment_method, paid_at,
-- installment_invoice_url, is_overdue, project_id, ..., expense_total_amount,
-- receipt_url, expense_invoice_url, ...

-- ============================================================================
-- TEST 3: Test splitAmountCentavos logic (manual verification)
-- ============================================================================

-- 10x de R$ 1.200,00
-- Expected: [120.00, 120.00, ..., 120.00] (10 times, sum = 1200.00)

-- 3x de R$ 1.000,00
-- Expected: [333.34, 333.33, 333.33] (sum = 1000.00 exactly)

-- Query to verify: Create test expense and check installments
-- (This will be done via app, verified below)

-- ============================================================================
-- TEST 4: Test payment update uses installments.id (SQL verification)
-- ============================================================================

-- This test CANNOT be run as SQL (it's app-side code check)
-- But verify: grep output confirms zero `.eq("expense_id"...update)` patterns

-- ============================================================================
-- TEST 5: Create test data and verify aggregation
-- ============================================================================

-- Find a test project (or create one)
-- For this example, assume project_id = 'test-project-id'

-- Create a test expense with 3 installments of R$ 1.000,00 each
-- (This is done via the app, not raw SQL)

-- Once created, query to verify:
SELECT
  installment_number,
  total_installments,
  amount,
  due_date,
  status,
  payment_method,
  paid_at
FROM installments
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID'
ORDER BY installment_number;

-- Expected output:
-- | installment_number | total_installments | amount | due_date   | status  | payment_method | paid_at |
-- | 1                  | 3                  | 333.34 | 2026-07-02 | pending | pix            | NULL    |
-- | 2                  | 3                  | 333.33 | 2026-08-02 | pending | pix            | NULL    |
-- | 3                  | 3                  | 333.33 | 2026-09-02 | pending | pix            | NULL    |

-- Verify sum
SELECT SUM(amount) AS total_amount
FROM installments
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID';
-- Expected: 1000.00 (exactly, no rounding error)

-- ============================================================================
-- TEST 6: Test individual installment status updates
-- ============================================================================

-- Simulate marking installment 1 as paid
UPDATE installments
SET status = 'paid', paid_at = NOW()
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID' AND installment_number = 1;

-- Verify only installment 1 changed
SELECT installment_number, status, paid_at
FROM installments
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID'
ORDER BY installment_number;

-- Expected:
-- | 1 | paid    | <timestamp> |
-- | 2 | pending | NULL        |
-- | 3 | pending | NULL        |

-- Mark installment 3 as paid (skip 2)
UPDATE installments
SET status = 'paid', paid_at = NOW()
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID' AND installment_number = 3;

-- Verify selective payment
SELECT installment_number, status
FROM installments
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID'
ORDER BY installment_number;

-- Expected:
-- | 1 | paid    |
-- | 2 | pending |
-- | 3 | paid    |

-- ============================================================================
-- TEST 7: Test payment_method per-installment
-- ============================================================================

-- Simulate updating payment method of only installment 2
UPDATE installments
SET payment_method = 'cartao_credito'
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID' AND installment_number = 2;

-- Verify only installment 2 changed
SELECT installment_number, payment_method
FROM installments
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID'
ORDER BY installment_number;

-- Expected:
-- | 1 | pix               |
-- | 2 | cartao_credito    |
-- | 3 | pix               |

-- ============================================================================
-- TEST 8: Test view aggregation for dashboard
-- ============================================================================

-- Query dashboard totals via view
SELECT
  COUNT(*) AS total_installments,
  SUM(amount) AS total_amount,
  SUM(CASE WHEN installment_status = 'paid' THEN amount ELSE 0 END) AS total_paid,
  SUM(CASE WHEN installment_status != 'paid' THEN amount ELSE 0 END) AS total_pending,
  SUM(CASE WHEN is_overdue THEN amount ELSE 0 END) AS total_overdue
FROM expense_installments_view
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID';

-- Expected (after tests above):
-- | total_installments | total_amount | total_paid | total_pending | total_overdue |
-- | 3                  | 1000.00      | 666.67     | 333.33        | 0.00 (or >0 if due_date < today) |

-- ============================================================================
-- TEST 9: Test RLS (Row-Level Security)
-- ============================================================================

-- As the logged-in user, run this (app handles auth):
-- Should see ONLY installments for their own project

SELECT COUNT(*) FROM installments;
-- This should only count installments for projects you own

-- Test: Attempt to select installments from OTHER users' projects
-- (This is blocked by RLS, will return 0 or error)

-- ============================================================================
-- TEST 10: Verify is_overdue calculation
-- ============================================================================

-- Create a test expense with due_date in the past
-- Then verify is_overdue = true for pending ones

SELECT
  installment_number,
  due_date,
  status,
  is_overdue
FROM expense_installments_view
WHERE expense_id = 'YOUR_TEST_EXPENSE_ID'
  AND due_date < CURRENT_DATE;

-- Expected:
-- Rows with status='pending' and due_date < today should have is_overdue=true
-- Rows with status='paid' should have is_overdue=false (even if due_date < today)

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Run this summary to confirm everything is ready:

SELECT
  (SELECT COUNT(*) FROM installments) AS installments_count,
  (SELECT COUNT(*) FROM expense_installments_view) AS view_rows_count,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'installments') AS table_exists,
  (SELECT COUNT(*) FROM pg_indexes
   WHERE tablename = 'installments') AS indexes_count;

-- Expected:
-- | installments_count | view_rows_count | table_exists | indexes_count |
-- | >0 (or 0)          | >0 (or 0)       | 1            | 4             |

-- ============================================================================
-- CLEANUP (optional, remove test data)
-- ============================================================================

-- DELETE FROM installments WHERE expense_id = 'YOUR_TEST_EXPENSE_ID';
-- DELETE FROM expenses WHERE id = 'YOUR_TEST_EXPENSE_ID';

-- ============================================================================
-- END OF VALIDATION TESTS
-- ============================================================================
