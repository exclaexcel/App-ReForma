-- Objetivo: criar despesa + parcelas numa transação (SECURITY INVOKER).
-- Pré-check: tabelas expenses e installments com RLS on.
-- Interromper se: CHECK de installments.amount / status divergir.
-- Rollback: DROP FUNCTION create_expense_with_installments(...);
-- Pós-check (depois de aplicar): SUM(installments.amount) = expenses.amount na despesa nova.
-- NÃO trocar expense-form.tsx até esta migration estar aplicada no live.

CREATE OR REPLACE FUNCTION create_expense_with_installments(
  p_project_id uuid,
  p_category_id uuid,
  p_supplier_id uuid,
  p_expense_type text,
  p_description text,
  p_amount numeric,
  p_expense_date date,
  p_payment_method text,
  p_is_paid boolean,
  p_receipt_url text,
  p_invoice_url text,
  p_invoice_number text,
  p_invoice_value numeric,
  p_installments jsonb
) RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_expense_id uuid;
  elem jsonb;
BEGIN
  INSERT INTO expenses (
    project_id,
    category_id,
    supplier_id,
    expense_type,
    description,
    amount,
    expense_date,
    payment_method,
    is_paid,
    receipt_url,
    invoice_url,
    invoice_number,
    invoice_value
  ) VALUES (
    p_project_id,
    p_category_id,
    p_supplier_id,
    p_expense_type,
    p_description,
    p_amount,
    p_expense_date,
    p_payment_method,
    p_is_paid,
    p_receipt_url,
    p_invoice_url,
    p_invoice_number,
    p_invoice_value
  )
  RETURNING id INTO v_expense_id;

  IF p_installments IS NULL OR jsonb_array_length(p_installments) = 0 THEN
    RAISE EXCEPTION 'create_expense_with_installments: installments required';
  END IF;

  FOR elem IN SELECT value FROM jsonb_array_elements(p_installments)
  LOOP
    INSERT INTO installments (
      expense_id,
      installment_number,
      total_installments,
      amount,
      due_date,
      status,
      payment_method,
      paid_at,
      invoice_url
    ) VALUES (
      v_expense_id,
      (elem->>'installment_number')::int,
      (elem->>'total_installments')::int,
      (elem->>'amount')::numeric,
      (elem->>'due_date')::date,
      COALESCE(elem->>'status', 'pending'),
      COALESCE(elem->>'payment_method', p_payment_method),
      NULLIF(elem->>'paid_at', '')::timestamptz,
      NULLIF(elem->>'invoice_url', '')
    );
  END LOOP;

  RETURN v_expense_id;
END;
$$;
