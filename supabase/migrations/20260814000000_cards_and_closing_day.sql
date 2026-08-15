-- Multi-cartão + dia de fechamento da fatura.
-- Objetivo: cards por obra (nome, closing_day, due_day) + expenses.card_id.
-- Seed: 1 card por projeto com card_due_day; backfill card_id em despesas de crédito.
-- Rollback: DROP TABLE cards CASCADE; ALTER TABLE expenses DROP COLUMN card_id;
-- NÃO dropar projects.card_due_day neste passo.

CREATE TABLE IF NOT EXISTS public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  due_day smallint NOT NULL,
  closing_day smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cards_due_day_check CHECK (due_day >= 1 AND due_day <= 28),
  CONSTRAINT cards_closing_day_check CHECK (closing_day >= 1 AND closing_day <= 28)
);

COMMENT ON TABLE public.cards IS
  'Cartões de crédito da obra: dia de fechamento (corte) e dia de vencimento da fatura.';
COMMENT ON COLUMN public.cards.due_day IS
  'Dia do mês do vencimento da fatura (1–28).';
COMMENT ON COLUMN public.cards.closing_day IS
  'Dia do mês do fechamento/corte da fatura (1–28). Compra até este dia entra na fatura do mês seguinte.';

CREATE INDEX IF NOT EXISTS cards_project_id_idx ON public.cards (project_id);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cards_select_own ON public.cards;
DROP POLICY IF EXISTS cards_insert_own ON public.cards;
DROP POLICY IF EXISTS cards_update_own ON public.cards;
DROP POLICY IF EXISTS cards_delete_own ON public.cards;

CREATE POLICY cards_select_own ON public.cards
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

CREATE POLICY cards_insert_own ON public.cards
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

CREATE POLICY cards_update_own ON public.cards
  FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY cards_delete_own ON public.cards
  FOR DELETE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS card_id uuid REFERENCES public.cards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS expenses_card_id_idx ON public.expenses (card_id);

COMMENT ON COLUMN public.expenses.card_id IS
  'Cartão usado na compra (crédito). NULL se não for cartão ou ainda não migrado.';

-- Seed: um cartão por obra que já tinha dia de vencimento.
INSERT INTO public.cards (project_id, name, due_day, closing_day)
SELECT
  p.id,
  'Cartão',
  p.card_due_day,
  p.card_due_day
FROM public.projects p
WHERE p.card_due_day IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.cards c WHERE c.project_id = p.id
  );

-- Backfill: despesas com parcela de crédito herdam o cartão da obra (se houver um só).
UPDATE public.expenses e
SET card_id = c.id
FROM public.cards c
WHERE e.card_id IS NULL
  AND e.project_id = c.project_id
  AND EXISTS (
    SELECT 1
    FROM public.installments i
    WHERE i.expense_id = e.id
      AND i.payment_method = 'cartao_credito'
  )
  AND (
    SELECT COUNT(*) FROM public.cards c2 WHERE c2.project_id = e.project_id
  ) = 1;
