-- Objetivo: amarrar UPDATE de parcelas ao p_expense_id e fixar search_path.
-- Pré-check: função public.edit_expense_with_installments existe e é INVOKER.
-- Interromper se: assinatura da função no live divergir (args extras/menos).
-- Rollback: restaurar 20260714120000_edit_expense_with_installments_rpc.sql.
-- Pós-check: UPDATE com id de parcela de outra despesa da mesma usuária não altera linha.

CREATE OR REPLACE FUNCTION edit_expense_with_installments(
  p_expense_id uuid,
  p_category_id uuid,
  p_room_id uuid,
  p_supplier_id uuid,
  p_expense_type text,
  p_description text,
  p_amount numeric,
  p_expense_date date,
  p_receipt_url text,
  p_invoice_url text,
  p_invoice_number text,
  p_invoice_value numeric,
  p_is_paid boolean,
  p_installment_amounts jsonb DEFAULT NULL,
  p_single_installment_id uuid DEFAULT NULL,
  p_single_installment_status text DEFAULT NULL,
  p_single_installment_paid_at timestamptz DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE expenses SET
    category_id = p_category_id,
    room_id = p_room_id,
    supplier_id = p_supplier_id,
    expense_type = p_expense_type,
    description = p_description,
    amount = p_amount,
    expense_date = p_expense_date,
    receipt_url = p_receipt_url,
    invoice_url = p_invoice_url,
    invoice_number = p_invoice_number,
    invoice_value = p_invoice_value,
    is_paid = p_is_paid
  WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'expense not found or not permitted: %', p_expense_id;
  END IF;

  IF p_installment_amounts IS NOT NULL THEN
    UPDATE installments i SET amount = (elem->>'amount')::numeric
    FROM jsonb_array_elements(p_installment_amounts) elem
    WHERE i.id = (elem->>'id')::uuid
      AND i.expense_id = p_expense_id;
  END IF;

  IF p_single_installment_id IS NOT NULL THEN
    UPDATE installments SET
      status = p_single_installment_status,
      paid_at = p_single_installment_paid_at
    WHERE id = p_single_installment_id
      AND expense_id = p_expense_id;
  END IF;
END;
$$;
