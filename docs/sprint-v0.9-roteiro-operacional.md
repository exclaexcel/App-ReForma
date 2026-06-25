# Sprint v0.9 — Roteiro Operacional (versão final)

## Context

O ReForma está em produção estável (v0.8). Três tarefas de engenharia pura:
- **#6** Schema inicial versionado: tabelas base criadas via Supabase UI, nunca via código. Nenhum `000_initial_schema.sql` existe.
- **#7** Migration history sincronizada: 3 migrations antigas (`001_`, `002_`, `003_`) não foram rastreadas pelo Supabase CLI. CLI não está inicializado no projeto (sem `config.toml`). Solução: usar `supabase migration repair` nativo — sem renomear arquivos, sem tabela customizada.
- **#8** Tipos automáticos: `lib/database.types.ts` não existe. Tipos em `lib/types.ts` são manuais.

**Restrições aprovadas:**
- NÃO renomear migrations históricas
- NÃO criar `_schema_migrations` customizada — usar tracking nativo do Supabase CLI
- Schema inicial derivado de auditoria real do BD remoto, não de suposições
- Branch: `sprint-v0.9-infra` com 3 commits lógicos

**Restrições de produção:**
- Sem downtime. Migrations só aplicadas via SQL Editor com `NOT VALID` onde aplicável.
- Supabase CLI sem Docker para este projeto. Operações de BD são contra o remoto `bhsvvpvfbszrcitjwxxl`.

---

## Branch Strategy

```bash
git checkout -b sprint-v0.9-infra
# commit 1: feat(infra): add schema baseline migration and seed
# commit 2: chore(infra): initialize supabase cli and repair migration history
# commit 3: feat(infra): add auto-generated database types and ci workflow
```

---

## TAREFA #6 — Schema Inicial Versionado

### Pré-passo obrigatório: Auditoria do BD Remoto

Rodar cada bloco no SQL Editor do Supabase (UI → SQL Editor → projeto `bhsvvpvfbszrcitjwxxl`):

**Bloco 1 — Colunas de todas as tabelas:**
```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('projects','categories','rooms','expenses','schedule_events','suppliers','tasks')
ORDER BY table_name, ordinal_position;
```

**Bloco 2 — Constraints (CHECK, FK, UNIQUE):**
```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('projects','categories','rooms','expenses','schedule_events','suppliers','tasks')
ORDER BY tc.table_name, tc.constraint_type;
```

**Bloco 3 — Índices:**
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('projects','categories','rooms','expenses','schedule_events','suppliers','tasks')
ORDER BY tablename, indexname;
```

**Bloco 4 — RLS ativo:**
```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('projects','categories','rooms','expenses','schedule_events','suppliers','tasks')
ORDER BY relname;
```

**Bloco 5 — Policies RLS:**
```sql
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Bloco 6 — FK entre tabelas:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

> Salvar o output de cada bloco. O arquivo `20260501000000_initial_schema.sql` deve refletir exatamente esses resultados — sem invenção de colunas.

---

### Arquivos a criar

| Arquivo | Descrição |
|---|---|
| `supabase/migrations/20260501000000_initial_schema.sql` | DDL consolidado das 7 tabelas base |
| `supabase/seed.sql` | Seed mínimo para testes |

### Estrutura do `20260501000000_initial_schema.sql`

O arquivo deve seguir esta ordem (FK dependency order) e usar `CREATE TABLE IF NOT EXISTS` + `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY` (para idempotência):

```
1. projects        (referencia auth.users)
2. categories      (FK → projects)
3. rooms           (FK → projects)
4. suppliers       (FK → projects)
5. expenses        (FK → projects, categories, rooms, suppliers)
6. schedule_events (FK → projects, auth.users)
7. tasks           (FK → projects, rooms)
```

Cada tabela inclui em sequência: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ENABLE ROW LEVEL SECURITY`, `DROP POLICY IF EXISTS` (×4), `CREATE POLICY` (×4).

### Estrutura do `supabase/seed.sql`

```sql
-- Seed mínimo — uso local apenas. Nunca executar em produção.
-- Substituir USER_ID_AQUI pelo auth.uid() real no ambiente de teste.
DO $$
DECLARE
  v_project_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO projects (id, user_id, name, total_budget, start_date)
  VALUES (v_project_id, 'USER_ID_AQUI'::uuid, 'Projeto Teste', 50000, CURRENT_DATE);

  INSERT INTO categories (project_id, name, color_hex)
  VALUES (v_project_id, 'Mão de Obra', '#C84B31');
END $$;
```

### Commit #1

```bash
git add supabase/migrations/20260501000000_initial_schema.sql supabase/seed.sql
git commit -m "feat(infra): add schema baseline migration and seed"
```

---

## TAREFA #7 — Migration History Sincronizada

### Estratégia: Supabase CLI nativo + migration repair

Sem renomear arquivos. Sem tabelas customizadas.
O Supabase CLI rastreia migrations via tabela interna `supabase_migrations.schema_migrations`.

### Arquivos a criar

| Arquivo | Descrição |
|---|---|
| `supabase/config.toml` | Inicializa Supabase CLI para o projeto |

### Conteúdo de `supabase/config.toml`

```toml
# Supabase CLI project config — ReForma
# Projeto remoto: bhsvvpvfbszrcitjwxxl

[api]
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
port = 54323

[inbucket]
port = 54324

[storage]
file_size_limit = "50MiB"

[auth]
site_url = "http://localhost:3000"
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false
```

### Sequência de comandos — migration repair

```bash
# 1. Instalar CLI (se não instalado)
npm install -g supabase
supabase --version

# 2. Autenticar
supabase login
# Abrir https://app.supabase.com/account/tokens → gerar token → colar

# 3. Linkar projeto remoto
supabase link --project-ref bhsvvpvfbszrcitjwxxl

# 4. Ver estado atual das migrations no remoto
supabase migration list

# 5. Marcar cada migration histórica como já aplicada
#    (existem no remoto mas o CLI não sabe disso ainda)
supabase migration repair --status applied 20260501000000
supabase migration repair --status applied 001_rls_policies
supabase migration repair --status applied 002_suppliers
supabase migration repair --status applied 003_tasks
supabase migration repair --status applied 20260622120000
supabase migration repair --status applied 20260624000000

# 6. Verificar sincronização — todos devem aparecer como "applied"
supabase migration list
```

> **Nota:** O Supabase CLI usa o nome do arquivo sem `.sql` como identificador. Confirmar os nomes exatos retornados por `supabase migration list` antes de rodar o repair.

### Riscos

| Risco | Mitigação |
|---|---|
| `supabase migration list` retornar erro de autenticação | Verificar token e reautenticar com `supabase login` |
| CLI tentar re-aplicar migration já aplicada | `repair --status applied` apenas registra, não executa SQL |
| config.toml com porta conflitante | Parâmetros de porta ignorados ao operar `--remote` sem Docker |

### Commit #2

```bash
git add supabase/config.toml
git commit -m "chore(infra): initialize supabase cli and repair migration history"
```

---

## TAREFA #8 — Tipos Automáticos do Supabase

### Arquivos a criar

| Arquivo | Como |
|---|---|
| `lib/database.types.ts` | Gerado por `supabase gen types typescript` — commitar o resultado |
| `.github/workflows/generate-types.yml` | Manual |

### Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `lib/types.ts` | Importar de `database.types.ts`; manter somente custom types e constants |
| `package.json` | Adicionar script `"types:gen"` |

### Comando de geração

```bash
supabase gen types typescript --project-id bhsvvpvfbszrcitjwxxl > lib/database.types.ts
```

### Estrutura final de `lib/types.ts`

```typescript
import type { Database } from './database.types';

// Re-exports de tabelas — fonte: database.types.ts (não editar lá)
export type Project       = Database['public']['Tables']['projects']['Row'];
export type Category      = Database['public']['Tables']['categories']['Row'];
export type Room          = Database['public']['Tables']['rooms']['Row'];
export type Expense       = Database['public']['Tables']['expenses']['Row'];
export type Supplier      = Database['public']['Tables']['suppliers']['Row'];
export type Task          = Database['public']['Tables']['tasks']['Row'];
export type ScheduleEvent = Database['public']['Tables']['schedule_events']['Row'];

// Tipos de mutação (úteis em forms)
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

// Tipo com joins — para queries .select('*, categories(*), rooms(*), suppliers(id,name)')
export type ExpenseWithRelations = Expense & {
  categories: Category | null;
  rooms: Room | null;
  suppliers: Pick<Supplier, 'id' | 'name'> | null;
};

// Tipos derivados — não geráveis automaticamente (manter aqui)
export type PaymentMethod    = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto';
export type ExpenseType      = 'mao_obra' | 'material' | 'loja' | 'servico' | 'outro';
export type DocStatus        = 'completo' | 'pendente' | 'sem_comprovante' | 'divergencia' | 'sem_regra';
export type TaskStatus       = 'pendente' | 'em_andamento' | 'concluido';
export type EventType        = 'entrega_material' | 'servico_mao_obra' | 'pagamento' | 'visita_tecnica';
export type SupplierSpecialty = 'Elétrica' | 'Hidráulica' | 'Pintura' | 'Marcenaria' | 'Gesso' | 'Piso' | 'Outros';

// Constantes e labels (manter aqui)
export const EXPENSE_TYPES: ExpenseType[] = ['mao_obra', 'material', 'loja', 'servico', 'outro'];
export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  mao_obra: 'Mão de Obra', material: 'Material', loja: 'Loja / Acabamento',
  servico: 'Serviço', outro: 'Outro',
};
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX', cartao_credito: 'Cartão de Crédito', cartao_debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro', boleto: 'Boleto',
};
export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  completo: 'Documentado', pendente: 'Doc. incompleta',
  sem_comprovante: 'Sem comprovante', divergencia: 'Divergência', sem_regra: '—',
};
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: 'Pendente', em_andamento: 'Em Andamento', concluido: 'Concluído',
};
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  entrega_material: 'Entrega de Material', servico_mao_obra: 'Serviço / Mão de Obra',
  pagamento: 'Pagamento', visita_tecnica: 'Visita Técnica',
};
export const SUPPLIER_SPECIALTIES: SupplierSpecialty[] = [
  'Elétrica', 'Hidráulica', 'Pintura', 'Marcenaria', 'Gesso', 'Piso', 'Outros',
];
export const DEFAULT_CATEGORIES = [
  { name: 'Mão de Obra', color_hex: '#C84B31' },
  { name: 'Materiais Brutos', color_hex: '#5C3A21' },
  { name: 'Acabamentos', color_hex: '#D97757' },
  { name: 'Móveis e Decoração', color_hex: '#92400e' },
];
```

### Script em `package.json`

```json
"types:gen": "supabase gen types typescript --project-id bhsvvpvfbszrcitjwxxl > lib/database.types.ts"
```

### Conteúdo de `.github/workflows/generate-types.yml`

```yaml
name: Regenerate Supabase Types

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'
  workflow_dispatch:

jobs:
  generate-types:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Supabase CLI
        run: npm install -g supabase

      - name: Generate TypeScript types
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase gen types typescript \
            --project-id bhsvvpvfbszrcitjwxxl \
            > lib/database.types.ts

      - name: Commit updated types
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: regenerate database types [skip ci]'
          file_pattern: lib/database.types.ts
```

**Requer:** Secret `SUPABASE_ACCESS_TOKEN` em GitHub → Repo Settings → Secrets → Actions.

### Commit #3

```bash
git add lib/database.types.ts lib/types.ts package.json .github/workflows/generate-types.yml
git commit -m "feat(infra): add auto-generated database types and ci workflow"
```

---

## Resumo: Arquivos Criados / Modificados

### Criar (5 arquivos)
1. `supabase/migrations/20260501000000_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/config.toml`
4. `lib/database.types.ts` (gerado por CLI, commitado)
5. `.github/workflows/generate-types.yml`

### Modificar (2 arquivos)
6. `lib/types.ts` — refatorar para importar de `database.types.ts`
7. `package.json` — adicionar script `types:gen`

### NÃO tocar
- Migrations existentes (nenhum rename)
- `app/`, `components/`
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `lib/utils.ts`, `lib/queries/`
- `.github/workflows/preview.yml`

---

## Checklist Operacional

### Setup inicial

```
[ ] S1. git checkout -b sprint-v0.9-infra
[ ] S2. npm install -g supabase && supabase --version
[ ] S3. supabase login  (token em app.supabase.com/account/tokens)
```

### Bloco A — Auditoria e Schema Baseline (#6)

```
[ ] A1. Rodar os 6 blocos de auditoria no SQL Editor remoto
[ ] A2. Salvar output dos 6 blocos
[ ] A3. Criar supabase/migrations/20260501000000_initial_schema.sql baseado no output real
[ ] A4. Criar supabase/seed.sql
[ ] A5. Revisar: 7 tabelas presentes? Constraints corretas? Policies sem acento nos nomes?
[ ] A6. git add + git commit -m "feat(infra): add schema baseline migration and seed"
```

### Bloco B — CLI Init e Migration Repair (#7)

```
[ ] B1. Criar supabase/config.toml
[ ] B2. supabase link --project-ref bhsvvpvfbszrcitjwxxl
[ ] B3. supabase migration list → anotar quais não aparecem como "applied"
[ ] B4. supabase migration repair --status applied <nome> para cada migration histórica
[ ] B5. supabase migration list → confirmar todos como "applied"
[ ] B6. git add supabase/config.toml + git commit -m "chore(infra): initialize supabase cli and repair migration history"
```

### Bloco C — Tipos Automáticos (#8)

```
[ ] C1. supabase gen types typescript --project-id bhsvvpvfbszrcitjwxxl > lib/database.types.ts
[ ] C2. Verificar database.types.ts: 7 tabelas? expenses tem expense_type, status, invoice_url?
[ ] C3. Refatorar lib/types.ts: importar Database, re-exportar types, manter customs + constants
[ ] C4. npx tsc --noEmit → resolver todos os erros antes de continuar
[ ] C5. npm run build → deve passar limpo
[ ] C6. Adicionar script types:gen em package.json
[ ] C7. Criar .github/workflows/generate-types.yml
[ ] C8. Adicionar secret SUPABASE_ACCESS_TOKEN no GitHub (Settings → Secrets → Actions)
[ ] C9. git add + git commit -m "feat(infra): add auto-generated database types and ci workflow"
[ ] C10. git push origin sprint-v0.9-infra
[ ] C11. Abrir PR: sprint-v0.9-infra → main
[ ] C12. Verificar GitHub Action "Regenerate Supabase Types" executa e fica verde
```

### QA Final

```
[ ] Q1. npx tsc --noEmit → 0 erros
[ ] Q2. npm run build → 0 erros
[ ] Q3. npm run lint → 0 warnings novos
[ ] Q4. Produção (https://appreforma.vercel.app): login + criar despesa + ver dashboard
[ ] Q5. supabase migration list → todos os arquivos com status "applied"
```

---

## Estimativa de Tempo

| Bloco | Tempo |
|---|---|
| Setup (S1–S3) | 15min |
| Bloco A (auditoria + schema) | 2h |
| Bloco B (CLI init + repair) | 45min |
| Bloco C (tipos + CI) | 2h |
| QA Final | 30min |
| **Total** | **~5.5h** |
