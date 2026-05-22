CREATE TABLE IF NOT EXISTS suppliers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  specialty   text,
  whatsapp    text,
  budget_url  text,
  rating      smallint CHECK (rating BETWEEN 1 AND 5),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
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
