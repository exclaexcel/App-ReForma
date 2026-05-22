-- Add missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Normalize existing status values
UPDATE tasks SET status = 'pendente'    WHERE status IS NULL OR status = 'Pendente';
UPDATE tasks SET status = 'em_andamento' WHERE status = 'Em Andamento';
UPDATE tasks SET status = 'concluido'   WHERE status = 'Concluído';

-- Add CHECK constraint (idempotent)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('pendente', 'em_andamento', 'concluido'));

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: usuário acessa apenas seus projetos" ON tasks;
DROP POLICY IF EXISTS tasks_select_own ON tasks;
DROP POLICY IF EXISTS tasks_insert_own ON tasks;
DROP POLICY IF EXISTS tasks_update_own ON tasks;
DROP POLICY IF EXISTS tasks_delete_own ON tasks;

CREATE POLICY tasks_select_own ON tasks
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY tasks_insert_own ON tasks
  FOR INSERT WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY tasks_update_own ON tasks
  FOR UPDATE USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY tasks_delete_own ON tasks
  FOR DELETE USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
