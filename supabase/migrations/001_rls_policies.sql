-- =============================================================
-- RLS Policies — App ReForma
-- Aplicar no Supabase SQL Editor (Settings > SQL Editor)
-- Revisar antes de executar. Rodar uma seção de cada vez.
-- =============================================================


-- -------------------------------------------------------------
-- TABELA: projects
-- Cada usuário só acessa seus próprios projetos.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- TABELA: categories
-- Acesso restrito a categorias cujo project_id pertence ao usuário.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- TABELA: expenses
-- Acesso restrito a despesas cujo project_id pertence ao usuário.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- TABELA: rooms
-- Acesso restrito a cômodos cujo project_id pertence ao usuário.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- TABELA: schedule_events
-- Acesso restrito a eventos cujo project_id pertence ao usuário.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- STORAGE: bucket receipts
-- Aplicar em: Storage > Policies > receipts
-- Usuário só acessa arquivos sob o seu próprio user_id como prefixo.
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "receipts: select próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: insert próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: update próprio" ON storage.objects;
DROP POLICY IF EXISTS "receipts: delete próprio" ON storage.objects;

-- Visualizar/download (signed URLs e leitura direta)
CREATE POLICY "receipts: select próprio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Upload
CREATE POLICY "receipts: insert próprio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Sobrescrever arquivo existente
CREATE POLICY "receipts: update próprio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Deletar comprovante
CREATE POLICY "receipts: delete próprio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
