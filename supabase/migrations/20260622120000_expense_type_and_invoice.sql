-- Migration 004: Add expense_type, invoice fields, and data migration
-- Purpose: Replace 'phase' with 'expense_type' and add invoice tracking

-- 1. Add new columns
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS expense_type  text,
  ADD COLUMN IF NOT EXISTS invoice_url   text,
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoice_value numeric,
  ADD COLUMN IF NOT EXISTS paid_at date;

-- 2. Migrate data from phase to expense_type (map old phase values)
-- If phase was 'Estrutura', set to 'material'; if 'Mobiliário & Decor', set to 'loja'
UPDATE expenses
SET expense_type = CASE
  WHEN phase = 'Estrutura' THEN 'material'
  WHEN phase = 'Mobiliário & Decor' THEN 'loja'
  ELSE 'outro'
END
WHERE expense_type IS NULL AND phase IS NOT NULL;

-- For any remaining nulls, default to 'outro'
UPDATE expenses SET expense_type = 'outro' WHERE expense_type IS NULL;

-- 3. Add constraint: expense_type must have a value
ALTER TABLE expenses ADD CONSTRAINT expenses_type_not_null CHECK (expense_type IS NOT NULL);

-- 4. Set paid_at = expense_date if is_paid is true (initial data migration)
UPDATE expenses SET paid_at = expense_date::date WHERE is_paid = true AND paid_at IS NULL;

-- 5. Drop the old phase column
ALTER TABLE expenses DROP COLUMN IF EXISTS phase;

-- 6. Add constraint: amount must be positive
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_positive CHECK (amount > 0);
