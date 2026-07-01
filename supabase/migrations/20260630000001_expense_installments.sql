ALTER TABLE expenses
  ADD COLUMN installment_count  int DEFAULT 1 CHECK (installment_count >= 1),
  ADD COLUMN installment_number int DEFAULT 1,
  ADD COLUMN parent_expense_id  uuid REFERENCES expenses(id) ON DELETE CASCADE;

CREATE INDEX idx_expenses_parent ON expenses(parent_expense_id);
