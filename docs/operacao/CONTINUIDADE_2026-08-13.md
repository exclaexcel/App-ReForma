# Fechamento + continuidade — 2026-08-12 → amanhã 13

> @ esta nota no próximo chat.

## K — Fechamento (2026-08-12)

**Feito**

- Higiene docs: `AGENTS.md`, índice `docs/`, nesting visual no Explorer
- Fechamento parcial da auditoria (não OK geral)
- Escopo **v1.0** em `docs/produto/V1.0.md` (7 itens)
- Obs: leaked password = Pro → adiado; SQLs Aug12 = higiene, sem urgência

**Parado em**

- Nada bloqueando uso do app

**Decisões**

- v1.0 inclui: cartão (fechamento + multi), form seções, agenda↔despesa, total fornecedor, CNPJ, % docs Hub
- **Prioridade Dany:** cartão antes dos ganhos rápidos (CNPJ/%/gráficos)
- Sem commit da higiene docs nesta sessão

**Riscos**

- Fechamento/multi-cartão mexem em regra + possível migration → precisa ok + backup

**Arquivos**

- `docs/produto/V1.0.md`, backlogs, `AGENTS.md`, `docs/README.md`

**Repo**

- Branch `main` | dirty: docs higiene + v1.0 (sem commit pedido)

---

## L — Amanhã (2026-08-13)

**Objetivo (1):** começar **fechamento de fatura** (dia de corte + vencimento).

**Premissas**

- Hoje só existe `card_due_day`; falta closing day
- Sem multi-cartão no mesmo PR (menor diff)
- Sem aplicar SQL Aug12 de higiene
- Sem upgrade Pro

**1º passo seguro**  
Mapear no código: `nextCardDueDate` + form da obra + onde a 1ª parcela é calculada. Propor regra em 5 linhas e **esperar ok** antes de migration.

**Depois**  
Migration `card_closing_day` + UI na obra + recalcular só parcelas `pending` (com ok).

**Pronto quando**  
Compra depois do fechamento cai no vencimento certo (prova com 2 datas de exemplo).

**Se travar**  
Regra de negócio ambígua → para e pergunta; não inventa SQL no chat.

**Fora do bloco**  
Multi-cartão (próximo item); CNPJ/%/gráficos; form seções; commit sem pedido.
