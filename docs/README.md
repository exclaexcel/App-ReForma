# Documentação — ReForma

Índice do repositório. Código: `app/`, `components/`, `lib/`, `supabase/`.  
Regras locais do agente: [`../AGENTS.md`](../AGENTS.md) · visual: [`../.cursorrules`](../.cursorrules).

## Pastas

| Pasta                        | Conteúdo                                               | Status                     |
| ---------------------------- | ------------------------------------------------------ | -------------------------- |
| [produto/](./produto/)       | PRD, roadmap, quick start                              | vigente                    |
| [operacao/](./operacao/)     | Deploy, staging, Storage, SQL, templates, continuidade | vigente                    |
| [incidentes/](./incidentes/) | Relatos e scripts de incidentes                        | histórico operacional      |
| [auditoria/](./auditoria/)   | Auditorias, backlogs e relatórios                      | misto (ver atalhos)        |
| [arquivo/](./arquivo/)       | Dumps e rascunhos                                      | **não** é fonte de verdade |

## Atalhos — começar aqui

| Precisa de                                   | Arquivo                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Rodar o app                                  | [produto/DEV-QUICK-START.md](./produto/DEV-QUICK-START.md)                                 |
| Roadmap                                      | [produto/SPRINT-ROADMAP.md](./produto/SPRINT-ROADMAP.md)                                   |
| **Escopo v1.0**                              | [produto/V1.0.md](./produto/V1.0.md)                                                       |
| PRD                                          | [produto/PRD_MD.txt](./produto/PRD_MD.txt)                                                 |
| Auditoria vigente (fechamento parcial 08-12) | [auditoria/2026-08-11-auditoria-completa.md](./auditoria/2026-08-11-auditoria-completa.md) |
| Backlog UX                                   | [auditoria/backlog-ux.md](./auditoria/backlog-ux.md)                                       |
| Backlog técnico                              | [auditoria/backlog-pendencias.md](./auditoria/backlog-pendencias.md)                       |
| Continuidade K+L                             | [operacao/CONTINUIDADE_2026-08-13.md](./operacao/CONTINUIDADE_2026-08-13.md)               |
| Verificação banco                            | [operacao/VERIFICACAO_BANCO_2026-08-10.md](./operacao/VERIFICACAO_BANCO_2026-08-10.md)     |
| Template e-mail reset                        | [operacao/email-template-reset-password.md](./operacao/email-template-reset-password.md)   |
| Storage / comprovantes                       | [operacao/armazenamento-documentos.md](./operacao/armazenamento-documentos.md)             |
| Incidentes                                   | [incidentes/](./incidentes/)                                                               |

## Raiz do repo (só estes docs)

| Arquivo        | Papel                                              |
| -------------- | -------------------------------------------------- |
| `README.md`    | Onboarding humano                                  |
| `AGENTS.md`    | Regras locais para agentes (Cursor/Claude)         |
| `.cursorrules` | Stack + Reforma Chique (sempre aplicado no Cursor) |

Não deixar dumps, auditorias ou continuidade soltos na raiz — vão para `docs/` nas pastas acima.

## Nota

Docs em `auditoria/` (exceto backlogs + relatório `2026-08-11-*`) e tudo em `arquivo/` são **históricos**.  
Estado atual do produto = código + `supabase/migrations/`.

Lixo local (`.claude/`, `.codex/`, `supabase/.temp/`) fica no `.gitignore` — não versionar.
