ALTER TABLE schedule_events
  ADD COLUMN expense_id  UUID REFERENCES expenses(id) ON DELETE SET NULL,
  ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  ADD COLUMN room_id     UUID REFERENCES rooms(id) ON DELETE SET NULL,
  ADD COLUMN status      VARCHAR DEFAULT 'pendente'
               CHECK (status IN ('pendente', 'confirmado', 'concluído')),
  ADD COLUMN photo_url   TEXT;
