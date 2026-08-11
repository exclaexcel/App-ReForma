# Fechamento + continuidade — 2026-08-10 / amanhã 11

> @ esta nota no próximo chat.

## K — Fechamento (2026-08-10)

**Feito**

- Regra A cartão: `projects.card_due_day` (migration aplicada no Supabase); 1ª parcela = mês seguinte; recalcula pending ao salvar obra
- Hub: card Fluxo de caixa (este mês / atrasadas / próximo + atalhos)
- Despesas: chips Este mês / Atrasadas (`?filtro=`)
- Gráficos: compra vs vencimento + toggle A pagar | Todas
- Lista: título sem `(1/8)` legado; badge `parc. N/M`
- Deploy: `305ab4a` falhou (regex `/u`); fix `f623306` → produção **READY**

**Parado em**

- Bottom Nav mobile com Fornecedores apertado (só anotado)

**Decisões**

- Cartão: vencimento no mês seguinte à compra (não no mesmo mês)
- Dois gráficos (compra + fluxo), não toggle único Compra|Vencimento
- Centavos de arredondamento OK

**Riscos**

- Sem dia do cartão configurado, lançamento em crédito é bloqueado
- Conteúdo novo exige hard refresh se CDN/cache antigo

**Arquivos-chave**

- `lib/utils.ts`, `components/project-edit-form.tsx`, `expense-form.tsx`
- `app/(app)/page.tsx`, `despesas/page.tsx`, `graficos/page.tsx`
- `components/cash-flow-trend-section.tsx`
- `supabase/migrations/20260811000000_projects_card_due_day.sql`
- `docs/auditoria/backlog-ux.md` (#U-MOBILE-NAV)

**Repo**

- Branch: `main` | dirty: backlog-ux + higiene docs (gitignore agent junk)
- Commits no ar: `305ab4a` + `f623306` | prod: https://appreforma.vercel.app

**Higiene docs (antes de dormir)**

- `.gitignore`: `.claude/`, `.codex/`, `supabase/.temp/`
- Dumps → `docs/arquivo/`; renomes em auditoria (`primeira-aud`, `auditoria-1`, `raio-x`)
- Índice atualizado em `docs/README.md`

---

## L — Continuidade (amanhã)

**Objetivo (1):** Ajustar Bottom Nav no celular para Fornecedores caber sem quebrar layout.

**Premissas**

- Problema = 6 itens + FAB em 430px; labels longos
- Preferir menor mudança; manter identidade Reforma Chique
- Não mexer em regra de cartão/fluxo salvo regressão

**1º passo seguro**

- Abrir `/fornecedores` no mobile (ou DevTools 390px) + inspecionar `bottom-nav.tsx`
- Decidir: (A) 5 abas e Fornecedores só no hub, (B) ícone sem label/abreviado, (C) menu “mais”

**Depois**

- Implementar opção escolhida + testar todas as rotas da nav
- Commit/push se ok visual

**Pronto quando**

- Nav legível no celular; Fornecedores acessível; FAB intacto; dark/light ok

**Se travar**

- Print + largura do device; comparar com Despesas/Agenda

**Fora do bloco**

- Fechamento de fatura (closing day); multi-cartão; export CSV mês
