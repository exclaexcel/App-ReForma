-- Add status column to expenses table for soft-delete functionality
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo'
  CHECK (status IN ('ativo', 'cancelado'));

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
