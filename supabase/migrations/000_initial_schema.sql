-- =============================================================
-- Baseline schema — App ReForma
-- Objetivo: permitir recriar o banco a partir do repositório.
-- Idempotente (IF NOT EXISTS / ON CONFLICT). Seguro em banco já
-- existente: não sobrescreve dados; só cria o que faltar.
--
-- Ordem: este arquivo vem ANTES de 001_rls_policies.sql e dos
-- ALTERs posteriores (expense_type, installments, etc.).
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  total_budget numeric NOT NULL DEFAULT 0,
  start_date   date,
  end_date     date,
  card_due_day smallint CHECK (card_due_day IS NULL OR (card_due_day >= 1 AND card_due_day <= 28)),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects (user_id);

-- -------------------------------------------------------------
-- categories
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  color_hex   text NOT NULL DEFAULT '#C84B31'
);

CREATE INDEX IF NOT EXISTS categories_project_id_idx ON public.categories (project_id);

-- -------------------------------------------------------------
-- rooms (UI removida; tabela mantida para dados existentes)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rooms_project_id_idx ON public.rooms (project_id);

-- -------------------------------------------------------------
-- expenses (colunas base; migrations posteriores adicionam o resto)
-- phase existe aqui para a migration expense_type poder migrar/dropar.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id     uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  room_id         uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  supplier_id     uuid,
  description     text NOT NULL,
  amount          numeric NOT NULL,
  expense_date    date NOT NULL DEFAULT CURRENT_DATE,
  payment_method  text NOT NULL DEFAULT 'pix',
  is_paid         boolean NOT NULL DEFAULT false,
  receipt_url     text,
  phase           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_project_id_idx ON public.expenses (project_id);
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON public.expenses (expense_date);

-- -------------------------------------------------------------
-- schedule_events (colunas base; FKs extras em migration posterior)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  event_type  text,
  start_date  date NOT NULL,
  end_date    date,
  notes       text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schedule_events_project_id_idx ON public.schedule_events (project_id);
CREATE INDEX IF NOT EXISTS schedule_events_start_date_idx ON public.schedule_events (start_date);

-- -------------------------------------------------------------
-- tasks (003_tasks.sql só ALTER + RLS — CREATE fica aqui)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  room_id         uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  title           text NOT NULL,
  status          text DEFAULT 'pendente',
  sequence_order  integer,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON public.tasks (project_id);

-- -------------------------------------------------------------
-- Storage bucket: receipts
-- Policies ficam em 001_rls_policies.sql
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;
