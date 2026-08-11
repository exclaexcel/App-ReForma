-- Dia de vencimento da fatura do cartão (fluxo de caixa).
-- Usado para gerar due_date de parcelas com payment_method = cartao_credito.
-- Intervalo 1–28 evita ambiguidade em meses curtos.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS card_due_day smallint;

ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_card_due_day_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_card_due_day_check
  CHECK (card_due_day IS NULL OR (card_due_day >= 1 AND card_due_day <= 28));

COMMENT ON COLUMN projects.card_due_day IS
  'Dia do mês do vencimento da fatura do cartão (1–28). NULL = não configurado.';
