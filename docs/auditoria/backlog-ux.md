# Backlog de UX/Usabilidade — App ReForma

**Gerado em:** 2026-06-24  
**Revalidado em:** 2026-08-11 — ver [2026-08-11-auditoria-completa.md](./2026-08-11-auditoria-completa.md)

---

## 📌 Anotado 2026-08-11

- [x] **#U-MOBILE-NAV Fornecedores + Bottom Nav no celular** — `components/bottom-nav.tsx`  
       Aba **Mais**; sheet com Fornecedores e Comprovantes acima da barra (`bottom-24`).

---

## 🔴 CRÍTICO — Quebra de fluxo ou dado perdido

- [x] **#U1 Delete de cômodo** — **morto**. `room-manager.tsx` e UI de cômodos removidos. Tabelas `rooms`/`tasks` só no banco.

- [x] **#U2 Ausência total de toast** — **stale**. `sonner` + `Toaster` no root. Falta toast só em editar obra (U19).

- [x] **#U3 `schedule-event-form.tsx` — Labels sem `htmlFor`** — feito 2026-08-11.

---

## 🟠 ALTO — Frustração frequente no uso diário

- [x] **#U4 Criar despesa redireciona para `/despesas`** — conferido 2026-08-11.
- [x] **#U5 Empty state de despesas com CTA** — `despesas/page.tsx` (sem filtro ativo).
- [x] **#U6 Empty state de comprovantes com link `/novo`**.
- [x] **#U7 Trash ~44px** — `p-3` em expense/supplier; task-form morto.
- [x] **#U8 Ícone-only com `aria-label`** nos Plus/Trash vivos; diário/cômodos mortos. Residual: estrelas, X da agenda, filtros com `title`.

---

## 🟡 MÉDIO

- [x] **#U9 Fornecedores na nav** — via Mais. Diário **morto**. Hub não lista Fornecedores (atalho só no Mais).
- [x] **#U10 `/dashboard`** — stub `redirect("/")`.
- [ ] **#U11 Formulário de despesa sem seções** — ainda válido; **não mudar sem ok** (UX aprovada).
- [x] **#U12 Estrelas** — feito 2026-08-11 (`text-stone-300 dark:text-zinc-600` + `aria-label`).
- [x] **#U13 `*` em Valor/Descrição/Data** — feito 2026-08-11.
- [x] **#U14 `window.confirm`** — zero matches; `ConfirmDialog`.
- [x] **#U15 `invoiceNumber` `inputMode="numeric"`** — feito 2026-08-11.
- [x] **#U16 Editar obra redireciona para `/` com toast** — feito 2026-08-11.
- [x] **#U18 Filtros: `aria-label`** — feito 2026-08-11.
- [x] **#U19 Toast no salvar obra** — feito 2026-08-11 (junto com U16).

---

## 🔵 BAIXO

- [x] **#U17 Empty dashboard CTA** — Hub tem Link `/novo`.

---

## Resumo 2026-08-11 (abertos)

U11 (seções do form — espera ok).
