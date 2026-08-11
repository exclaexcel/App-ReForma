# Verificação banco remoto — ReForma (2026-08-10)

**Projeto:** `bhsvvpvfbszrcitjwxxl` (appreforma)  
**Objetivo:** 2ª verificação código ↔ banco (auditoria ago/2026)

## O que foi tentado nesta sessão

| Canal                                                                             | Resultado                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| MCP `plugin-supabase` / `user-supabase` `execute_sql`                             | Timeout de conexão (várias tentativas)                   |
| MCP `list_migrations`                                                             | Timeout                                                  |
| CLI `supabase db query --linked`                                                  | **403** — conta sem privilégio no endpoint de login role |
| CLI `supabase db advisors --linked`                                               | **403** (mesmo motivo)                                   |
| MCP `get_advisors` security                                                       | OK — **0 lints**                                         |
| MCP `get_advisors` performance                                                    | OK — **0 lints**                                         |
| `lib/database.types.ts` (`npm run types:gen` → project-id `bhsvvpvfbszrcitjwxxl`) | Snapshot tipado com tabelas/view/RPC esperados           |

## Evidência indireta (não substitui SQL ao vivo)

Tipos gerados incluem: `projects`, `categories`, `expenses`, `rooms`, `schedule_events`, `suppliers`, `tasks`, `installments`, view `expense_installments_view`, função `edit_expense_with_installments`.

Advisors vazios = sem achados conhecidos de security/performance no painel Supabase via MCP — **não** prova que RLS/bucket existem.

## SQL para rodar no Dashboard (SQL Editor) — prova definitiva

```sql
-- 1) Tabelas e views
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type IN ('BASE TABLE', 'VIEW')
ORDER BY 1;

-- 2) RLS ligado
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;

-- 3) View + RPC
SELECT to_regclass('public.expense_installments_view') AS view_ok;
SELECT proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND proname = 'edit_expense_with_installments';

-- 4) Bucket receipts
SELECT id, name, public FROM storage.buckets WHERE id = 'receipts';

-- 5) Policies storage receipts
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'receipts:%'
ORDER BY 1;
```

## Critérios de interrupção

Se alguma linha acima faltar (view, RPC, bucket, RLS off): **não** aplicar novas migrations sem backup e alinhamento explícito.

## Status desta auditoria

- **Verificação SQL ao vivo (pós-restore, 2026-08-10):** **OK**
  - Tabelas: `categories`, `expenses`, `installments`, `projects`, `rooms`, `schedule_events`, `suppliers`, `tasks`
  - View: `expense_installments_view`
  - RPC: `edit_expense_with_installments`
  - RLS: ligado em todas as tabelas base acima
  - Bucket: `receipts` (private)
  - Migrations remotas: alinhadas com o repo **exceto** `000_initial_schema` (só no Git; banco já tinha o schema — **não aplicar** sem necessidade; se quiser sincronizar histórico, usar `migration repair`)
- **REST** (`/rest/v1/projects`): respondeu 200 com publishable key
- **Advisors MCP:** limpos (checagem anterior)
- **Mitigação no repo:** migration `000_initial_schema.sql` versiona CREATE das tabelas base + bucket `receipts` (idempotente)

## Também fechado no app (pós-auditoria)

- `/dashboard` → redirect para `/`
- WhatsApp do fornecedor abre `wa.me`
- Categorias gerenciáveis em `/projeto/editar`
- Ícones PWA em `public/`
