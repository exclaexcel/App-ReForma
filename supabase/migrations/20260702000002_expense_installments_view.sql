-- View flattening installments for list/dashboard queries
-- Enables existing code to read installments as if they were flat expense rows

CREATE OR REPLACE VIEW expense_installments_view AS
SELECT
  i.id AS installment_id,
  i.expense_id,
  i.installment_number,
  i.total_installments,
  i.amount,
  i.due_date,
  i.status AS installment_status,
  i.payment_method,
  i.paid_at,
  i.invoice_url AS installment_invoice_url,
  (i.status = 'pending' AND i.due_date < CURRENT_DATE) AS is_overdue,
  e.project_id,
  e.category_id,
  e.room_id,
  e.supplier_id,
  e.expense_type,
  e.description,
  e.amount AS expense_total_amount,
  e.expense_date,
  e.receipt_url,
  e.invoice_url AS expense_invoice_url,
  e.invoice_number,
  e.invoice_value,
  e.status AS expense_status,
  e.created_at
FROM installments i
JOIN expenses e ON e.id = i.expense_id
WHERE e.status = 'ativo';

ALTER VIEW expense_installments_view SET (security_invoker = true);
