# Auditoria Técnica — App Reforma (Tech Lead Day 1)

**Data:** 2026-06-22  
**Stack:** Next.js 14 App Router · TypeScript · Supabase (Auth + Postgres + Storage) · Tailwind CSS · Radix UI · Recharts · Deploy Vercel  
**Evidência:** varredura real do código — sem suposições de commits.

---

## 1. MAPA DO PROJETO

```
app/
  (app)/          ← rotas protegidas (auth guard duplo: middleware + layout)
    page.tsx       ← home/hub logado
    dashboard/     ← KPIs financeiros
    novo/          ← form de nova despesa
    despesas/      ← listagem + filtros + CSV export
    despesas/[id]/editar/
    comodos/       ← CRUD inline de cômodos
    comprovantes/  ← galeria de recibos (signed URLs)
    graficos/      ← 3 gráficos (waterfall, barras, área)
    agenda/        ← cronograma (criar funciona; editar/deletar NÃO)
    fornecedores/  ← CRUD completo
    fornecedores/novo/
    fornecedores/[id]/editar/
    diario-obras/  ← CRUD de tarefas com filtros e progresso
    diario-obras/nova/
    diario-obras/[id]/editar/
    projeto/editar/
  (auth)/
    login/ signup/ recuperar-senha/ atualizar-senha/
  api/auth/callback/route.ts  ← PKCE callback OAuth

components/       ← sem pasta hooks/ ou services/ separados
lib/
  queries/getProject.ts
  supabase/client.ts + server.ts
  types.ts         ← tipos manuais (não gerados do schema)
  utils.ts
middleware.ts
supabase/migrations/  ← 3 arquivos (SEM migration 000 — schema base ausente)
```

**BottomNav cobre apenas:** `/` · `/despesas` · `/novo` · `/agenda` · `/graficos`  
**Fora da nav:** Diário de Obras, Cômodos, Comprovantes, Fornecedores — existem mas sem acesso direto.

---

## 2. MÓDULOS — STATUS REAL

| Módulo | Veredicto | Observação |
|---|---|---|
| Auth (login/signup/reset/PKCE) | ✅ Funcional | Signup pode falhar silenciosamente se Supabase exige e-mail confirm |
| Dashboard | ✅ Funcional | Server component, errors lançados corretamente |
| Despesas (CRUD + upload + CSV) | ✅ Funcional | Erros de listagem silenciosos (console.error apenas) |
| Fornecedores (CRUD) | ✅ Funcional | WhatsApp sem validação de formato |
| Cômodos (CRUD inline) | ✅ Funcional | Delete sem confirmação (sem window.confirm) |
| Gráficos (3 tipos) | ✅ Funcional | — |
| Diário de Obras / Tarefas | ✅ Funcional | Campo `sequence_order` existe no tipo mas sem UI nem insert |
| Pasta Digital / Comprovantes | ✅ Galeria funcional | Não permite upload direto — obriga ir em Despesas > Editar |
| **Agenda / Cronograma** | ⚠️ **PARCIAL** | **Criar: OK. Editar e Deletar: impossível pela UI** |
| Projeto (editar) | ✅ Funcional | Não redireciona após salvar — tela estática com mensagem de sucesso |

---

## 3. PENDÊNCIAS FUNCIONAIS (evidência de código)

### 3.1 Agenda — Editar/Deletar bloqueados
- `components/schedule-view.tsx` linhas 136-169: card de evento é read-only, sem botão de editar/excluir.  
- `components/schedule-event-form.tsx` tem toda a lógica de edição implementada (prop `initialEvent`, branch `isEditing`) mas **nenhum ponto de entrada no UI a invoca**.  
- Qualquer evento criado com data ou nome errado fica permanente para o usuário.

### 3.2 Schema base não versionado
- Migrations existem: `001_rls_policies.sql`, `002_suppliers.sql`, `003_tasks.sql` — todos são patches.  
- Não há `000_initial_schema.sql`. As tabelas `projects`, `categories`, `expenses`, `rooms`, `schedule_events` foram criadas fora do controle local.  
- Risco: impossível recriar o banco do zero a partir do repositório.

### 3.3 Tipos Supabase gerados manualmente
- `lib/types.ts` tem tipos escritos à mão com casts forçados em vários pontos:  
  - `despesas/page.tsx`: `setExpenses((expData ?? []) as Expense[])`  
  - `graficos/page.tsx`: `const cat = expense.categories as Category | null`  
- Qualquer mudança de schema no banco não quebra o build — falha silenciosa em runtime.

### 3.4 `sequence_order` em Tasks — infra sem UI
- `lib/types.ts` linha 116: `sequence_order: number | null`  
- `task-form.tsx`: campo nunca exposto, nunca populado no insert  
- `diario-obras/page.tsx`: orderBy usa `created_at`, não `sequence_order`  
- Feature de ordenação manual existe no modelo, mas não existe no produto.

---

## 4. BUGS PROVÁVEIS

### Bug crítico — non-null assertion em upload sem guard de sessão
**Arquivo:** `components/expense-form.tsx`  
```ts
const { data: { user } } = await supabase.auth.getUser();
const fileName = `${user!.id}/...`;
```
Se a sessão expirar exatamente durante o upload, `user` é `null` e o `!` gera `TypeError` não tratado ao invés de redirecionar para login.

### Bug de UX — erro de fetch sem feedback visual (4 módulos)
Padrão repetido em:
- `despesas/page.tsx:85` · `comprovantes/page.tsx:141` · `fornecedores/page.tsx:46` · `diario-obras/page.tsx:62`

Todos capturam o erro mas apenas fazem `console.error` — o usuário vê tela vazia sem saber se não há dados ou se houve falha de rede.

### Bug de lógica — agenda sem guard de error
`agenda/page.tsx` linha 23:
```ts
const { data: events = [] } = await supabase...
```
`error` ignorado — qualquer falha de query resulta em lista vazia silenciosa.

### Bug de segurança de sessão — catch vazio no server client
`lib/supabase/server.ts`:
```ts
} catch {}
```
`setAll` de cookies com catch completamente silencioso. Falhas de sessão em Server Components são mascaradas.

### Bug de UX — middleware com fallback inseguro
`middleware.ts`: o `try/catch` do `getUser()` tem comentário `// If getUser fails, let the request proceed`. Em caso de falha de rede com Supabase, rotas protegidas podem ser acessadas sem autenticação — o layout server-side é o último guard real.

### Bug de budget — aceita valor inválido silenciosamente
`components/create-first-project.tsx`:
```ts
parseFloat(budget.replace(",", ".")) || 0
```
Budget inválido ou vazio cria projeto com `total_budget = 0` sem aviso ao usuário.

---

## 5. ITENS FALTANDO PARA PRODUÇÃO

| Item | Severidade | Evidência |
|---|---|---|
| Zero testes — nem E2E, nem unitários | CRÍTICO | `package.json` sem script `test`; Playwright instalado mas sem `e2e/` |
| Sem paginação nas queries de listagem | ALTO | `despesas/page.tsx`, `comprovantes/page.tsx`, `diario-obras/page.tsx` sem `limit` |
| Estados de erro ausentes nos client components | ALTO | 4 páginas com catch silencioso |
| `next/image` substituído por `<img>` nativo | MÉDIO | `expense-form.tsx:351`, `comprovantes/page.tsx:54` com `eslint-disable` |
| Sem biblioteca de validação de formulários | MÉDIO | Sem Zod, sem react-hook-form; validação apenas via HTML `required` |
| Tipos Supabase manuais (drift silencioso) | MÉDIO | Nenhuma geração automática via `supabase gen types` |
| `createClient()` fora de useMemo no RoomManager | BAIXO | `room-manager.tsx:16` — recria instância a cada re-render |
| Sem `maxLength` nos campos de texto | BAIXO | Nenhum campo tem limite máximo definido no frontend |

---

## 6. BACKLOG PRIORIZADO

### P0 — Desbloqueadores funcionais (antes de qualquer usuário real)
1. **Agenda: adicionar botões de editar e deletar nos cards de evento**  
   A lógica já existe em `schedule-event-form.tsx`. Falta apenas wiring no `schedule-view.tsx`.

2. **Corrigir `user!.id` em expense-form.tsx com guard de sessão**  
   Substituir por `if (!user) { router.push('/login'); return; }`

3. **Adicionar estados de erro visíveis nos 4 client components**  
   `despesas/page.tsx`, `comprovantes/page.tsx`, `fornecedores/page.tsx`, `diario-obras/page.tsx`

### P1 — Qualidade e segurança
4. **Gerar migration 000 com schema inicial completo**  
   Exportar schema atual do Supabase e versionar localmente.

5. **Configurar `supabase gen types typescript` no projeto**  
   Eliminar todos os casts manuais `as Expense[]`, `as Category | null`.

6. **Paginação na listagem de despesas** (começa a doer com >100 registros)

### P2 — UX e robustez
7. **Confirmação de delete em Cômodos** (único módulo sem `window.confirm`)
8. **Redirect após salvar em Projeto Editar**
9. **Validação de WhatsApp em Fornecedores** (format mask ou regex)
10. **Substituir `<img>` por `next/image`** em expense-form e comprovantes

### P3 — Infraestrutura de qualidade
11. **Configurar Playwright** com ao menos 3 testes: login, criar despesa, visualizar gráfico
12. **Adicionar Zod** para validação de formulários no server-side
13. **Verificar se `.env.local` aparece em commits anteriores**: `git log --all --full-history -- .env.local`

---

## 7. SUGESTÃO DA PRÓXIMA MILESTONE: v0.5 "Pronto para Usuários Reais"

**Critério de entrada:** app funcional internamente (já está)  
**Critério de saída:** nenhum bug P0, nenhuma tela branca em falha de rede, fluxo de agenda completo

**Escopo:**
1. Agenda — editar e deletar eventos (2-3h, lógica já existe)
2. Guard de sessão no upload (30min)
3. Estados de erro visuais nos 4 módulos client (2h)
4. Migration 000 exportada e versionada (1h)
5. Paginação básica em despesas (2h)

**Total estimado:** ~8h de desenvolvimento focado  
**Resultado:** o app pode ser entregue para primeiros usuários beta com confiança mínima de estabilidade.

---

## Verificação pós-implementação
- Criar evento na Agenda → editar data → deletar: deve funcionar completamente
- Simular falha de rede no fetchData de despesas: deve exibir mensagem de erro, não tela branca
- Fazer upload de comprovante com sessão próxima do vencimento: não deve gerar TypeError
- `git log --all --full-history -- .env.local`: deve retornar vazio
