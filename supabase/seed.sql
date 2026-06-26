-- Seed mínimo — uso local apenas. Nunca executar em produção.
-- Substituir USER_ID_AQUI pelo auth.uid() real no ambiente de teste.

DO $$
DECLARE
  v_project_id uuid := gen_random_uuid();
  v_category_id uuid := gen_random_uuid();
  v_room_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO projects (id, user_id, name, total_budget, start_date)
  VALUES (v_project_id, 'USER_ID_AQUI'::uuid, 'Projeto Teste', 50000, CURRENT_DATE);

  INSERT INTO categories (id, project_id, name, color_hex)
  VALUES (v_category_id, v_project_id, 'Mão de Obra', '#C84B31');

  INSERT INTO rooms (id, project_id, name)
  VALUES (v_room_id, v_project_id, 'Sala de Estar');

  INSERT INTO expenses (
    project_id, category_id, room_id, expense_type,
    description, amount, expense_date, payment_method, is_paid, status
  )
  VALUES (
    v_project_id, v_category_id, v_room_id, 'mao_obra',
    'Pintura da sala', 1500.00, CURRENT_TIMESTAMP, 'pix', false, 'ativo'
  );
END $$;
