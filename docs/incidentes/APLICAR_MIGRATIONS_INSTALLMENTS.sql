-- ============================================================================
-- APLICAR MIGRATIONS: Installments (ReForma)
-- Data: 2026-07-07
--
-- INSTRUÇÕES:
-- 1. Copie TODO este conteúdo (Ctrl+A, Ctrl+C)
-- 2. Vá para: https://bhsvvpvfbszrcitjwxxl.supabase.co/dashboard/sql
-- 3. Clique em "New Query"
-- 4. Cole tudo (Ctrl+V)
-- 5. Clique em "Run" (ou Ctrl+Enter)
-- 6. Aguarde conclusão (deve levar alguns segundos)
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: 20260702000000_installments_table
-- Cria a tabela installments + RLS policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS installments (
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

CREATE INDEX IF NOT EXISTS idx_installments_expense_id     ON installments(expense_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date       ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status         ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_expense_status ON installments(expense_id, status);

CREATE OR REPLACE FUNCTION installments_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_installments_updated_at ON installments;
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

-- ============================================================================
-- MIGRATION 2: 20260702000001_backfill_installments
-- Migra dados antigos de expenses para installments
-- ============================================================================

-- 1. Pai (installment_number = 1 de série) -> installments
INSERT INTO installments (expense_id, installment_number, total_installments, amount, due_date, status, payment_method, paid_at, invoice_url, created_at)
SELECT
  e.id, 1, e.installment_count, e.amount, e.expense_date,
  CASE WHEN e.is_paid THEN 'paid' ELSE 'pending' END,
  e.payment_method, e.paid_at, e.invoice_url, e.created_at
FROM expenses e
WHERE e.installment_count > 1 AND e.parent_expense_id IS NULL
ON CONFLICT DO NOTHING;

-- 2. Filhas -> installments (usando installment_count do pai como total)
INSERT INTO installments (expense_id, installment_number, total_installments, amount, due_date, status, payment_method, paid_at, invoice_url, created_at)
SELECT
  c.parent_expense_id, c.installment_number, p.installment_count, c.amount,
  c.expense_date, CASE WHEN c.is_paid THEN 'paid' ELSE 'pending' END,
  c.payment_method, c.paid_at, c.invoice_url, c.created_at
FROM expenses c
JOIN expenses p ON p.id = c.parent_expense_id
WHERE c.parent_expense_id IS NOT NULL
ON CONFLICT DO NOTHING;

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
  AND (e.installment_count IS NULL OR e.installment_count = 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION 3: 20260702000002_expense_installments_view
-- Cria view flattening installments para queries nas telas
-- ============================================================================

CREATE OR REPLACE VIEW expense_installments_view AS
SELECT
  i.id AS installment_id,
  i.expense_id,
  i.installment_number,
  i.total_installments,
  i.amount,
  i.due_date,
  i.status AS installment_status,
  i.payment_method,
  i.paid_at,
  i.invoice_url AS installment_invoice_url,
  (i.status = 'pending' AND i.due_date < CURRENT_DATE) AS is_overdue,
  e.project_id,
  e.category_id,
  e.room_id,
  e.supplier_id,
  e.expense_type,
  e.description,
  e.amount AS expense_total_amount,
  e.expense_date,
  e.receipt_url,
  e.invoice_url AS expense_invoice_url,
  e.invoice_number,
  e.invoice_value,
  e.status AS expense_status,
  e.created_at
FROM installments i
JOIN expenses e ON e.id = i.expense_id
WHERE e.status = 'ativo';

ALTER VIEW expense_installments_view SET (security_invoker = true);

-- ============================================================================
-- VALIDAÇÃO: Verificar que tudo funcionou
-- ============================================================================

-- Se você vir números > 0 aqui, as migrations foram aplicadas com sucesso!
SELECT
  'Tabela installments criada' as status,
  COUNT(*) as total_parcelas
FROM installments;

SELECT
  'View expense_installments_view criada' as status,
  COUNT(*) as despesas_visíveis
FROM expense_installments_view;

-- ============================================================================
-- FIM DAS MIGRATIONS
-- ============================================================================
-- Depois de rodar este script, suas despesas deverão aparecer novamente em:
-- - /despesas (lista de despesas)
-- - Dashboard (totais e resumo)
-- - Home (visão geral)
--
-- Se algo não funcionar, avise com a mensagem de erro!
-- ============================================================================
