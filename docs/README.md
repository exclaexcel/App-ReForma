# Documentação — ReForma

Índice da documentação do repositório. Código do app continua em `app/`, `components/`, `lib/`, `supabase/`.

## Pastas

| Pasta                        | Conteúdo                                                      |
| ---------------------------- | ------------------------------------------------------------- |
| [produto/](./produto/)       | PRD, roadmap, quick start do time                             |
| [operacao/](./operacao/)     | Deploy, staging, Storage, validação SQL, verificação de banco |
| [incidentes/](./incidentes/) | Relatos e scripts de incidentes em produção                   |
| [auditoria/](./auditoria/)   | Auditorias, backlogs e relatórios técnicos (histórico)        |
| [arquivo/](./arquivo/)       | Dumps e materiais de referência (não são fonte de verdade)    |

## Atalhos

- Começar a desenvolver: [produto/DEV-QUICK-START.md](./produto/DEV-QUICK-START.md)
- Roadmap: [produto/SPRINT-ROADMAP.md](./produto/SPRINT-ROADMAP.md)
- Continuidade (hoje→amanhã): [operacao/CONTINUIDADE_2026-08-10.md](./operacao/CONTINUIDADE_2026-08-10.md)
- Verificação banco (pós-restore): [operacao/VERIFICACAO_BANCO_2026-08-10.md](./operacao/VERIFICACAO_BANCO_2026-08-10.md)
- Auditoria 2026-08-11: [auditoria/2026-08-11-auditoria-completa.md](./auditoria/2026-08-11-auditoria-completa.md)
- Backlog UX (incl. nav mobile): [auditoria/backlog-ux.md](./auditoria/backlog-ux.md)
- Incidentes: [incidentes/](./incidentes/)

## Nota

Docs em `auditoria/` e `arquivo/` são **históricos**. O estado atual do produto está no código + migrations em `supabase/migrations/`.

Lixo local (`.claude/`, `.codex/`, `supabase/.temp/`) fica no `.gitignore` — não versionar.
