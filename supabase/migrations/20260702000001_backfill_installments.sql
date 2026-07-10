-- Backfill installments from existing expenses rows

-- 1. Pai (installment_number = 1 de série) -> installments
INSERT INTO installments (expense_id, installment_number, total_installments, amount, due_date, status, payment_method, paid_at, invoice_url, created_at)
SELECT
  e.id, 1, e.installment_count, e.amount, e.expense_date,
  CASE WHEN e.is_paid THEN 'paid' ELSE 'pending' END,
  e.payment_method, e.paid_at, e.invoice_url, e.created_at
FROM expenses e
WHERE e.installment_count > 1 AND e.parent_expense_id IS NULL;

-- 2. Filhas -> installments (usando installment_count do pai como total)
INSERT INTO installments (expense_id, installment_number, total_installments, amount, due_date, status, payment_method, paid_at, invoice_url, created_at)
SELECT
  c.parent_expense_id, c.installment_number, p.installment_count, c.amount,
  c.expense_date, CASE WHEN c.is_paid THEN 'paid' ELSE 'pending' END,
  c.payment_method, c.paid_at, c.invoice_url, c.created_at
FROM expenses c
JOIN expenses p ON p.id = c.parent_expense_id
WHERE c.parent_expense_id IS NOT NULL;

-- 3. Recalcula expenses.amount do pai para o TOTAL (soma das parcelas)
UPDATE expenses e
SET amount = sub.total
FROM (
  SELECT expense_id, SUM(amount) AS total
  FROM installments
  GROUP BY expense_id
) sub
WHERE e.id = sub.expense_id AND e.installment_count > 1;

-- 4. Apaga linhas filhas redundantes
DELETE FROM expenses WHERE parent_expense_id IS NOT NULL;

-- 5. Despesas à vista (sem parcelamento) -> 1 linha em installments
INSERT INTO installments (expense_id, installment_number, total_installments, amount, due_date, status, payment_method, paid_at, invoice_url, created_at)
SELECT
  e.id, 1, 1, e.amount, e.expense_date,
  CASE WHEN e.is_paid THEN 'paid' ELSE 'pending' END,
  e.payment_method, e.paid_at, e.invoice_url, e.created_at
FROM expenses e
WHERE e.parent_expense_id IS NULL
  AND (e.installment_count IS NULL OR e.installment_count = 1);
