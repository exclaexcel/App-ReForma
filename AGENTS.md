# AGENTS.md — ReForma (regras locais do repo)

> **Cursor:** User Rules = método/identidade da Dany. Este arquivo + `.cursorrules` = regras **técnicas deste projeto**.  
> Conflito técnico → este arquivo / `.cursorrules`. Tom e processo → User Rules.

## Checklist deste repo

- PT-BR; chamar de **Dany**
- Premissas curtas antes de alterar código; menor diff; escopo travado
- Prova = comando/output/teste/log (sem isso = hipótese)
- Sem commit / push / deploy / migração no banco live sem pedido explícito
- Sem segredos, `.env`, tokens ou dumps financeiros no chat/Git
- UI: contraste em superfície composta; lint/build ≠ prova visual

## Stack

- Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Supabase (Auth + PostgreSQL + Storage + RLS)
- Recharts | Lucide React | deploy Vercel

Identidade visual e proibições: ver [`.cursorrules`](./.cursorrules) (“Reforma Chique”).

## Rotas reais (código atual)

| Rota                                                     | Função                               |
| -------------------------------------------------------- | ------------------------------------ |
| `/`                                                      | Hub (logado) ou Landing (não logado) |
| `/dashboard`                                             | KPIs + últimas despesas              |
| `/novo`                                                  | Nova despesa                         |
| `/despesas`                                              | Histórico                            |
| `/despesas/[id]/editar`                                  | Editar despesa                       |
| `/graficos`                                              | Waterfall / barras / área            |
| `/agenda`                                                | Cronograma                           |
| `/comprovantes`                                          | Pasta Digital                        |
| `/fornecedores`                                          | Fornecedores                         |
| `/projeto/editar`                                        | Dados da obra                        |
| `/login` `/signup` `/recuperar-senha` `/atualizar-senha` | Auth                                 |

Mobile-first: `max-width` 430px; Bottom Nav + FAB terracota (`/novo`).

## Banco e Supabase (pare e confirme)

- Projeto Supabase deste app: `bhsvvpvfbszrcitjwxxl`
- Preview e Produção no **mesmo** projeto Supabase = **mesmo banco**
- SQL de alteração só a partir de migração versionada em `supabase/migrations/` (copiar do arquivo, nunca inventar no chat)
- Não rodar `supabase db push` / `db reset` / link remoto / aplicar migration live sem: backup + ok explícito da Dany
- Schema no repo ≠ banco real sem auditoria (MCP/`execute_sql` ou CLI)
- RLS ativo; usuário só vê `user_id = auth.uid()`
- Nada de `SUPABASE_SERVICE_ROLE_KEY` no runtime do app nem no Git

## Documentação

| Onde                                     | O quê                                             |
| ---------------------------------------- | ------------------------------------------------- |
| [`README.md`](./README.md)               | Como rodar o app                                  |
| [`docs/README.md`](./docs/README.md)     | Índice da documentação                            |
| [`docs/produto/`](./docs/produto/)       | PRD, roadmap, quick start                         |
| [`docs/operacao/`](./docs/operacao/)     | Deploy, staging, Storage, SQL, continuidade       |
| [`docs/incidentes/`](./docs/incidentes/) | Incidentes de produção                            |
| [`docs/auditoria/`](./docs/auditoria/)   | Auditorias + backlogs (mistura vigente/histórico) |
| [`docs/arquivo/`](./docs/arquivo/)       | Dumps — **não** são fonte de verdade              |

Fonte de verdade do produto: **código** + `supabase/migrations/`.

## Não versionar

`.claude/`, `.codex/`, `supabase/.temp/`, `.env*.local`, backups, dumps financeiros — ver `.gitignore`.

## Entrega esperada de mudanças

Resumo | premissas | arquivos | o que mudou / não mudou | como testar | riscos | como desfazer
