# Auditoria completa — ReForma — 2026-08-11

**Premissas**

- Fonte: `main` em `62b6636`, código local, migrations em `supabase/migrations/`, banco live via MCP (schema/RLS/advisors/contagens de policy). Sem dump de despesa, sem `.env`, sem token no chat.
- Preview e Produção compartilham o mesmo projeto Supabase.
- Backlogs de junho = pista. Cada item foi revalidado.
- Achados **Críticos** abaixo tiveram 2ª verificação no arquivo (e, onde coube, no banco). O que não teve 2ª verificação está marcado.
- Lint/build ≠ prova visual.

**Prova visual**

| Superfície                                                                                                     | Status                                                                            |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Landing prod `https://appreforma.vercel.app` (deslogada)                                                       | Vista (WebFetch): título, CTA criar conta / login                                 |
| Bottom Nav + sheet Mais (logada, 390px, dark)                                                                  | Vista nesta sessão (print da Dany + ajuste `bottom-24`)                           |
| Hub logado (dark)                                                                                              | Vista em print (fluxo de caixa); layout ok com o sheet **depois** do fix do Radix |
| `/despesas`, `/novo`, `/agenda`, `/graficos`, `/fornecedores`, `/comprovantes`, `/projeto/editar`, light 390px | **Não verificado** no browser (sem `e2e/.auth` no disco)                          |
| Recuperação de senha ponta a ponta                                                                             | **Não verificado** (fluxo de e-mail)                                              |

---

## O que está bom

- Auth de login/signup com `getUser()` (não `getSession()`). Service role não vai para o client.
- RLS ligado em todas as tabelas `public` live. View `expense_installments_view` com `security_invoker`. RPC `edit_expense_with_installments` é INVOKER.
- Soft-delete `expenses.status = cancelado`; lista/Hub/gráficos usam a view de ativos.
- Parcelas com `paid_at`; crédito bloqueado sem `card_due_day`; 1ª fatura no mês seguinte.
- Hub: saldo disponível, fluxo do mês / atrasadas, atalhos `?filtro=`.
- Despesas: paginação 20, empty CTA, chips, CSV com tipo/NF, filtro pagos sem comprovante.
- Gráficos: barras + linha (compra e vencimento); **sem** pizza/rosca; sem prefixo `light:`.
- Nav: Mais com Fornecedores e Comprovantes; FAB intacto; sheet acima da barra.
- Toast (`sonner`) em despesa, fornecedor, agenda, categoria, parcela.
- Agenda: CRUD + ConfirmDialog. Fornecedores: CRUD + ConfirmDialog.
- Storage: bucket `receipts` privado.
- E2E Playwright existe (`e2e/*.spec.ts`).
- `000_initial_schema.sql` existe.

---

## Problemas

### Crítico (2ª verificação no arquivo)

**C1 — Callback de recovery bloqueado pelo middleware**

- Onde: [`middleware.ts`](middleware.ts) 49–57; [`app/(auth)/recuperar-senha/page.tsx`](<app/(auth)/recuperar-senha/page.tsx>) 23; [`app/api/auth/callback/route.ts`](app/api/auth/callback/route.ts).
- O quê: `redirectTo` aponta para `/api/auth/callback`. O matcher cobre `/api/*`. Sem sessão, o middleware manda para `/login` **antes** de `exchangeCodeForSession`.
- Por que importa: “Esqueci a senha” tende a falhar em produção.
- Correção: allowlist `/api/auth`; sanitizar `next`; tratar `{ error }` do exchange.
- Prioridade: Crítico.

**C2 — Open redirect em `next`**

- Onde: [`app/api/auth/callback/route.ts`](app/api/auth/callback/route.ts) 8–10.
- O quê: `next` entra cru em `${origin}${next}`. `next=//evil.com` é open redirect clássico.
- Por que importa: se o callback ficar alcançável, vira vetor.
- Correção: só path relativo que começa com `/` e não com `//`.
- Prioridade: Crítico.

**C3 — `exchangeCodeForSession` ignora `{ error }`**

- Onde: [`app/api/auth/callback/route.ts`](app/api/auth/callback/route.ts) 27–32.
- O quê: o SDK costuma **retornar** erro, não lançar. Código inválido segue para `next` sem sessão. `/atualizar-senha` é pública e chama `updateUser` assim mesmo.
- Correção: `const { error } = await ...`; se error → `/login`.
- Prioridade: Crítico.

### Alto

**A1 — `server.ts` relança erro de cookie no RSC**

- Onde: [`lib/supabase/server.ts`](lib/supabase/server.ts) 18–25.
- O quê: template oficial `@supabase/ssr` **engole** o throw de `cookies().set` em Server Component. Relançar pode 500 ou cair no catch do layout.
- Correção: log opcional, sem `throw` (middleware refresca a sessão).
- Prioridade: Alto.

**A2 — Layout `(app)` não redireciona se o middleware falhar**

- Onde: [`app/(app)/layout.tsx`](<app/(app)/layout.tsx>) 18–26.
- O quê: `getUser()` com catch → `user = null` ainda renderiza `children` (só esconde a nav). Páginas client (`/despesas`, `/comprovantes`, `/fornecedores`) não fazem `redirect("/login")`.
- Correção: em rotas ≠ `/`, `redirect("/login")` quando não há user.
- Prioridade: Alto. Defesa em profundidade (não substitui C1).

**A3 — Orçamento inválido vira 0**

- Onde: [`components/create-first-project.tsx`](components/create-first-project.tsx) 28; [`app/(auth)/signup/page.tsx`](<app/(auth)/signup/page.tsx>) 58.
- O quê: `parseFloat(...) || 0`. Editar obra já valida (`project-edit-form.tsx` 76–80). Hub `pctUsado` divide por `total_budget` (página 96) → NaN se orçamento 0.
- Correção: mesma validação da edição; barra só se budget > 0.
- Prioridade: Alto.

**A4 — Comprovantes: skeleton infinito sem user/obra**

- Onde: [`app/(app)/comprovantes/page.tsx`](<app/(app)/comprovantes/page.tsx>) 100, 110 — `return` antes de `setLoading(false)`. Sem `finally`.
- Correção: `finally { setLoading(false) }` como em fornecedores.
- Prioridade: Alto.

**A5 — Copy “Excluir” no cancelamento de despesa**

- Onde: [`components/expense-form.tsx`](components/expense-form.tsx) 380–383 (status `cancelado`) vs 858–862 (“Excluir… não pode ser desfeita”).
- Por que importa: a ação é soft-delete; o texto mente.
- Correção: “Cancelar despesa?” / some da lista, histórico preservado.
- Prioridade: Alto (confiança no dado).

**A6 — Editar obra não redireciona / toast**

- Onde: [`components/project-edit-form.tsx`](components/project-edit-form.tsx) 114, 191–196. U16 + U19.
- Correção: `toast.success` + `router.push("/")` + `router.refresh()`.
- Prioridade: Alto.

### Moderado

**M1 — Labels da agenda sem `htmlFor`** — [`schedule-event-form.tsx`](components/schedule-event-form.tsx) ~179, 212, 329. U3.

**M2 — `*` inconsistente no form de despesa** — Valor/Descrição/Data têm `required` sem `*`. U13. [`expense-form.tsx`](components/expense-form.tsx) 428–468 vs Tipo com `*` ~594.

**M3 — Nº da NF sem `inputMode`** — [`expense-form.tsx`](components/expense-form.tsx) ~782. U15.

**M4 — Estrelas do fornecedor: duas cores no mesmo nó** — [`supplier-form.tsx`](components/supplier-form.tsx) 239: `text-zinc-600` + `text-stone-300`. U12. Sem `aria-label` nas estrelas.

**M5 — Filtros de despesas com `title` em vez de `aria-label`** — [`despesas/page.tsx`](<app/(app)/despesas/page.tsx>) 266, 284. U18 residual.

**M6 — `<img>` + eslint-disable** (comprovante/NF/agenda). next/image. U16 técnico. Blob/signed URL: tratar com cuidado.

**M7 — Form de despesa longo sem seções** — U11. UX já aprovada: **não mudar layout sem ok**.

**M8 — CSV exporta só o que está em memória** (páginas já carregadas), não o universo filtrado. Filename por dia, não por mês.

**M9 — Policies `ALL` duplicadas no live** (ex. `users_own_projects` + CRUD). Sem evidência de bypass cross-user. UPDATE sem `WITH CHECK` explícito (Postgres reusa USING). Drift repo vs banco. **SQL: pare e confirme.**

**M10 — Advisor:** `search_path` mutável em 2 funções; leaked password protection desligada no Auth. **Não é migração de dado; Auth é setting do dashboard.**

**M11 — Tabelas `rooms` e `tasks` órfãs** (RLS on, UI removida). Risco baixo; limpeza = destrutivo.

### Baixo

- Hub esconde `start_date` se não houver `end_date`; não há “dias corridos”.
- `expenses.paid_at` legado; o fluxo real é `installments.paid_at`.
- Overlay `bg-black/50` em dialogs (não é fundo de página).
- CSV sem coluna `paid_at`.
- Gráfico waterfall citado nas regras do projeto: arquivo não existe; o produto usa barras + linha.

---

## Lacunas de continuidade (só relatório — não implementar agora)

### Fechamento de fatura (closing day)

- Estado: só `projects.card_due_day` (1–28). Compra dia 2 ou 28 cai no **mesmo** mês seguinte (`lib/utils.ts` `nextCardDueDate`).
- Risco: fatura “errada” vs banco real se a Dany fecha no dia 10 e a compra é dia 12.
- MVP seguro: `card_closing_day` na obra; se `expense_date.day > closing` → vencimento em +2 meses. Recalcular só `pending`. Migration versionada + rollback. **Pare e confirme** a regra.

### Multi-cartão

- Estado: um dia por **obra**. Sem tabela `cards`, sem `card_id` em parcela.
- Risco: duas faturas no mesmo mês viram um número só.
- MVP: tabela `cards` (project_id, nome, due_day, closing_day?) + FK opcional na despesa/parcela. Maior que um sprint; não misturar com o closing day no mesmo PR se der para evitar.

### CSV do mês

- Estado: exporta o array já carregado, colunas boas (tipo, NF, vencimento), arquivo `despesas_YYYY-MM-DD.csv`.
- Risco: mês incompleto se a lista paginou; não há recorte “agosto/2026” no servidor.
- MVP: query no banco com `due_date` (ou `expense_date`) no intervalo do mês + filename `despesas_2026-08.csv`. Sem PII extra. Isolado, menor das três lacunas.

---

## Backlog junho — revalidação

Ver arquivos atualizados nesta data: [`backlog-ux.md`](backlog-ux.md), [`backlog-pendencias.md`](backlog-pendencias.md).

Morto (UI sumiu): cômodos, diário, `room-manager`, `task-form` (U1, partes de U7/U8/U9, #12/#13/#20/#22/#30).

Já feito no código: U4, U5, U6, toast em fluxos principais, paginação, cancelado, saldo no Hub, CSV tipo/NF, nav Mais, E2E, schema `000`, middleware fail-closed em rota protegida (o problema **novo** é o callback).

---

## Ordem segura — Fase 2

1. C1+C2+C3 (callback + `next` + error) — um patch, sem SQL.
2. A1 `server.ts` swallow.
3. A2 redirect no layout (exceto `/`).
4. A3 budget + divisão por zero no Hub.
5. A4 loading comprovantes.
6. A5 copy cancelar.
7. A6 toast + redirect ao salvar obra.
8. M1–M5 a11y pontual.
9. **Espera ok:** M6 next/image, M7 seções do form, M8 CSV mês, M9/M10 SQL/Auth dashboard, closing/multi-cartão, dropar `rooms`/`tasks`.

**Pare e confirme (não automático):** regra de cartão/parcela; migração; apagar tabela órfã; mudar layout do form de despesa.

---

## Fase 2 nesta sessão (código, sem SQL)

Aplicado: C1 allowlist `/api/auth/`; C2 sanitizar `next`; C3 `{ error }` do exchange; A1 swallow cookie no RSC; A3 budget válido + barra sem divisão por zero; A4 loading comprovantes; A5 copy cancelar; A6 toast + redirect ao salvar obra; M1 htmlFor agenda; M2 `*`; M3 `inputMode` NF; M4 estrelas; M5 `aria-label` filtros.

**Adiado (precisa ok ou é SQL/feature):** A2 redirect no layout (quebraria a landing em `/`); M6 next/image; M7 seções do form; M8 CSV mês; M9/M10 policies e Auth dashboard; fechamento/multi-cartão; dropar `rooms`/`tasks`.

---

## Cruzamento — auditoria Claude (2026-08-11, noite)

Relatório Claude lido contra o código + `pg_policy` live. **Não** vira 15º relatório vigente; este arquivo continua a fonte.

| Claude                          | Veredito                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 UPDATE sem WITH CHECK = IDOR | **Reclassificado.** Live: `with_check_expr` é NULL no catálogo. Postgres **reusa USING**. Explicitar WITH CHECK = higiene. SQL no repo `20260812000000_rls_update_with_check.sql` — **não aplicada**. |
| A2 recovery bloqueada           | **Já no working tree** (`/api/auth/` + sanitizar `next`). Prova: você testa o e-mail após deploy.                                                                                                     |
| A3 criação não atômica          | **Válido.** RPC `create_expense_with_installments` no repo (`20260812000002_…`) — **não aplicada**; form não trocado.                                                                                 |
| A4 CI sem tsc                   | Corrigido neste ciclo (`preview.yml`).                                                                                                                                                                |
| A5 remove antes de upload       | Corrigido neste ciclo.                                                                                                                                                                                |
| M6 nome cru Storage             | Corrigido (`sanitizeFileName`).                                                                                                                                                                       |
| M7 onboarding atômico           | **Espera ok** (SQL + signup).                                                                                                                                                                         |
| M8 RPC sem expense_id           | SQL `20260812000001_rpc_hardening.sql` no repo — **não aplicada**.                                                                                                                                    |
| M9 unit tests                   | Vitest + `lib/utils.test.ts`.                                                                                                                                                                         |
| M10 getStoragePath public       | Corrigido (`/object/sign/` + path relativo).                                                                                                                                                          |
| B11 headers                     | `next.config.mjs`.                                                                                                                                                                                    |
| B12 service role no example     | `.env.example` limpo.                                                                                                                                                                                 |
| B13 branch morta no CI          | Removida.                                                                                                                                                                                             |
| B14 extrair form                | Fora deste ciclo.                                                                                                                                                                                     |
