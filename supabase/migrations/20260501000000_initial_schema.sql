-- =============================================================
-- Initial Schema Baseline — ReForma v0.9
-- Consolidates all 7 tables with constraints and RLS policies
-- =============================================================

-- 1. projects (references auth.users)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_budget numeric NOT NULL CHECK (total_budget > 0),
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects: select próprio" ON projects;
DROP POLICY IF EXISTS "projects: insert próprio" ON projects;
DROP POLICY IF EXISTS "projects: update próprio" ON projects;
DROP POLICY IF EXISTS "projects: delete próprio" ON projects;

CREATE POLICY "projects: select próprio" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects: insert próprio" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: update próprio" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects: delete próprio" ON projects
  FOR DELETE USING (auth.uid() = user_id);


-- 2. categories (FK → projects)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  color_hex text NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories: select próprio" ON categories;
DROP POLICY IF EXISTS "categories: insert próprio" ON categories;
DROP POLICY IF EXISTS "categories: update próprio" ON categories;
DROP POLICY IF EXISTS "categories: delete próprio" ON categories;

CREATE POLICY "categories: select próprio" ON categories
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "categories: insert próprio" ON categories
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "categories: update próprio" ON categories
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "categories: delete próprio" ON categories
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );


-- 3. rooms (FK → projects)
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms: select próprio" ON rooms;
DROP POLICY IF EXISTS "rooms: insert próprio" ON rooms;
DROP POLICY IF EXISTS "rooms: update próprio" ON rooms;
DROP POLICY IF EXISTS "rooms: delete próprio" ON rooms;

CREATE POLICY "rooms: select próprio" ON rooms
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "rooms: insert próprio" ON rooms
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "rooms: update próprio" ON rooms
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "rooms: delete próprio" ON rooms
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );


-- 4. suppliers (FK → projects)
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text,
  whatsapp text,
  budget_url text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS suppliers_select_own ON suppliers;
DROP POLICY IF EXISTS suppliers_insert_own ON suppliers;
DROP POLICY IF EXISTS suppliers_update_own ON suppliers;
DROP POLICY IF EXISTS suppliers_delete_own ON suppliers;

CREATE POLICY suppliers_select_own ON suppliers
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY suppliers_insert_own ON suppliers
  FOR INSERT WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY suppliers_update_own ON suppliers
  FOR UPDATE USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY suppliers_delete_own ON suppliers
  FOR DELETE USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));


-- 5. expenses (FK → projects, categories, rooms, suppliers)
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  expense_type text NOT NULL CHECK (expense_type IN ('mao_obra', 'material', 'loja', 'servico', 'outro')),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  expense_date timestamptz NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto')),
  is_paid boolean NOT NULL DEFAULT false,
  receipt_url text,
  invoice_url text,
  invoice_number text,
  invoice_value numeric,
  paid_at date,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses: select próprio" ON expenses;
DROP POLICY IF EXISTS "expenses: insert próprio" ON expenses;
DROP POLICY IF EXISTS "expenses: update próprio" ON expenses;
DROP POLICY IF EXISTS "expenses: delete próprio" ON expenses;

CREATE POLICY "expenses: select próprio" ON expenses
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "expenses: insert próprio" ON expenses
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "expenses: update próprio" ON expenses
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "expenses: delete próprio" ON expenses
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );


-- 6. schedule_events (FK → projects, auth.users)
CREATE TABLE IF NOT EXISTS schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('entrega_material', 'servico_mao_obra', 'pagamento', 'visita_tecnica')),
  event_date timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedule_events: select próprio" ON schedule_events;
DROP POLICY IF EXISTS "schedule_events: insert próprio" ON schedule_events;
DROP POLICY IF EXISTS "schedule_events: update próprio" ON schedule_events;
DROP POLICY IF EXISTS "schedule_events: delete próprio" ON schedule_events;

CREATE POLICY "schedule_events: select próprio" ON schedule_events
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_events: insert próprio" ON schedule_events
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_events: update próprio" ON schedule_events
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_events: delete próprio" ON schedule_events
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );


-- 7. tasks (FK → projects, rooms)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  title text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
  sequence_order integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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


-- Storage: bucket receipts
-- Usuário só acessa arquivos sob seu próprio user_id como prefixo
DROP POLICY IF EXISTS "receipts: select próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: insert próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: update próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: delete próprio" ON storage.objects;

CREATE POLICY "receipts: select próprio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "receipts: insert próprio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "receipts: update próprio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "receipts: delete próprio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
