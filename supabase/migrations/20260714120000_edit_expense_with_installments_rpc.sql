-- Atomic edit of an expense plus its installments in a single round-trip.
-- Replaces the sequential UPDATE expenses / UPDATE installments (N+1) calls
-- previously done from components/expense-form.tsx, which could leave
-- expenses.amount out of sync with SUM(installments.amount) on partial
-- network failure.

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
  p_installment_amounts jsonb DEFAULT NULL,   -- [{"id": uuid, "amount": numeric}, ...]
  p_single_installment_id uuid DEFAULT NULL,
  p_single_installment_status text DEFAULT NULL,
  p_single_installment_paid_at timestamptz DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
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
    WHERE i.id = (elem->>'id')::uuid;
  END IF;

  IF p_single_installment_id IS NOT NULL THEN
    UPDATE installments SET
      status = p_single_installment_status,
      paid_at = p_single_installment_paid_at
    WHERE id = p_single_installment_id;
  END IF;
END;
$$;
