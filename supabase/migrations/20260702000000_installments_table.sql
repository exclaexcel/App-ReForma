-- installments table: per-installment financial control
-- One expenses row = one purchase; N installments rows = N payments.
-- Single-payment expenses get exactly 1 installments row.

CREATE TABLE installments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id         uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  installment_number int  NOT NULL CHECK (installment_number >= 1),
  total_installments int  NOT NULL CHECK (total_installments >= 1),
  amount             numeric(12,2) NOT NULL CHECK (amount > 0),
  due_date           date NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method     text NOT NULL,
  paid_at            timestamptz,
  invoice_url        text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),

  UNIQUE (expense_id, installment_number),
  CHECK (installment_number <= total_installments)
);

CREATE INDEX idx_installments_expense_id     ON installments(expense_id);
CREATE INDEX idx_installments_due_date       ON installments(due_date);
CREATE INDEX idx_installments_status         ON installments(status);
CREATE INDEX idx_installments_expense_status ON installments(expense_id, status);

CREATE OR REPLACE FUNCTION installments_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION installments_set_updated_at();

ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "installments: select próprio" ON installments;
CREATE POLICY "installments: select próprio" ON installments
  FOR SELECT USING (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "installments: insert próprio" ON installments;
CREATE POLICY "installments: insert próprio" ON installments
  FOR INSERT WITH CHECK (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "installments: update próprio" ON installments;
CREATE POLICY "installments: update próprio" ON installments
  FOR UPDATE USING (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "installments: delete próprio" ON installments;
CREATE POLICY "installments: delete próprio" ON installments
  FOR DELETE USING (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );
