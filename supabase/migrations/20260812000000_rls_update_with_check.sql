-- Objetivo: explicitar WITH CHECK nas policies UPDATE (Postgres já reusa USING
-- quando WITH CHECK é omitido; isto deixa a restrição visível no catálogo).
-- Pré-check: SELECT polname, pg_get_expr(polwithcheck, polrelid) FROM pg_policy
--   JOIN pg_class ON ... WHERE polcmd = 'w';
-- Interromper se: tabela sem RLS; policy de SELECT/INSERT/DELETE mudou de predicado.
-- Rollback: recriar as mesmas policies só com USING (como 001 / 002 / installments).
-- Pós-check: with_check_expr IS NOT NULL nas policies UPDATE listadas.
-- NÃO dropa policies ALL duplicadas (outro ok).

DROP POLICY IF EXISTS "projects: update próprio" ON projects;
CREATE POLICY "projects: update próprio" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "categories: update próprio" ON categories;
CREATE POLICY "categories: update próprio" ON categories
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "expenses: update próprio" ON expenses;
CREATE POLICY "expenses: update próprio" ON expenses
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "installments: update próprio" ON installments;
CREATE POLICY "installments: update próprio" ON installments
  FOR UPDATE
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    expense_id IN (
      SELECT id FROM expenses WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "schedule_events: update próprio" ON schedule_events;
CREATE POLICY "schedule_events: update próprio" ON schedule_events
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS suppliers_update_own ON suppliers;
CREATE POLICY suppliers_update_own ON suppliers
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
