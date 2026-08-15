# Backlog de Pendências — App ReForma

**Gerado em:** 2026-06-24  
**Revalidado em:** 2026-08-11 — [2026-08-11-auditoria-completa.md](./2026-08-11-auditoria-completa.md)  
**Fechamento parcial:** 2026-08-12 (ver seção no fim + relatório vigente)

---

## 🔴 CRÍTICO

- [x] **#1 Agenda: editar e deletar** — CRUD + ConfirmDialog em `schedule-view.tsx`.
- [x] **#2 Telas brancas / console.error** — despesas/fornecedores mostram erro; diário morto. Residual: comprovantes skeleton se `!user`/`!project` (A4).
- [x] **#3 Middleware fail-open** — **stale como descrito**. Hoje fail-closed. Problema **novo**: bloqueia `/api/auth/callback` (C1).
- [x] **#4 `catch {}` em `server.ts`** — **stale como empty catch**. Hoje log+throw (anti-padrão RSC) — A1.

---

## 🟠 ALTO

- [x] **#5 Paginação** — PAGE_SIZE 20 + carregar mais.
- [x] **#6 Schema `000_initial_schema.sql`** existe.
- [ ] **#7 Migration 004 repair** — não revalidado no CLI local nesta auditoria.
- [ ] **#8 Tipos** — `lib/types.ts` + `database.types.ts` ainda em paralelo; clientes nem sempre usam o genérico `Database`.
- [ ] **#9 `start_date`** — aparece no form e no Hub só se houver também `end_date`. Sem “dias corridos”.
- [x] **#10 `paid_at` nas parcelas** — preenchido no create/RPC/baixa. Sem trigger em `expenses.paid_at` (legado).
- [x] **#11 Cancelamento** — `status = cancelado`; view filtra ativos.

---

## 🟡 MÉDIO

- [x] **#12 BottomNav** — Mais cobre Fornecedores e Comprovantes. Diário/Cômodos mortos.
- [x] **#13 Delete cômodos** — UI morta.
- [x] **#14 Projeto/Editar sem redirect** — feito 2026-08-11 (toast + `/`).
- [x] **#15 WhatsApp** — `type="tel"` + `pattern` HTML (sem máscara JS).
- [ ] **#16 `<img>` vs `next/image`** — ainda válido.
- [x] **#17 Budget `|| 0` na criação** — feito 2026-08-11 (validação igual à edição).
- [x] **#18 Badge sem comprovante** — `expense-list-item.tsx`.
- [x] **#19 Filtro pagos sem comprovante** — filtros avançados.
- [x] **#20 `sequence_order`** — UI de tarefas morta.

---

## 🔵 BAIXO

- [x] **#21 Saldo no Hub**.
- [x] **#22 Total por cômodo** — cômodos fora do produto; N/A.
- [ ] **#23 Total por fornecedor** — ainda sem agregação nos gráficos.
- [ ] **#24 Curva acumulada** — linha mensal existe; acumulado explícito não.
- [x] **#25 CSV tipo/NF** — colunas presentes. **CSV mês:** feito 2026-08-12 (`handleExportMonth` → `despesas_YYYY-MM.csv` via query no banco, limite 5000).
- [ ] **#26 % documentação no Hub** — não conferido como KPI dedicado.

---

## ⚪ FUTURE

- [ ] **#27 E2E** — specs + CI endurecidos (ago/12). Auth local continua em `e2e/.auth` (gitignore — certo). Prod smoke crítico não deve rodar em prod.
- [ ] **#28 Agenda × financeiro** — `expense_id` existe no schema; vínculo na UI limitado.
- [ ] **#29 OCR de NF**
- [x] **#30 Relatório tarefas por cômodo** — N/A (UI morta).
- [ ] **#31 CNPJ fornecedor**
- [ ] **#32 Leaked Password Protection** — advisor: desligada. **Obs 2026-08-12:** exige plano **Pro** no Supabase; Dany **não** faz upgrade agora. Anotado para quando houver Pro (não bloqueia o app no Free).
- [x] **#33 Agrupamento mensal nos gráficos** — line chart mensal.

**Continuidade → alvo [v1.0](../produto/V1.0.md):** fechamento de fatura; multi-cartão; U11 form em seções; agenda↔despesa; **total por fornecedor**; **CNPJ**; **% documentação no Hub**. CSV do mês → **feito** (#25).

**SQLs Aug12 no repo (não aplicados no live — só com ok + backup):**

| Arquivo                                               | Em português                                                                                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260812000000_rls_update_with_check.sql`            | Deixa explícito na regra de UPDATE: “só altera o que é seu”. Hoje o Postgres já faz isso; o SQL só documenta no catálogo (higiene).                   |
| `20260812000001_rpc_hardening.sql`                    | Ao editar despesa, a parcela só atualiza se for **daquela** despesa. Também fixa `search_path` da função.                                             |
| `20260812000002_create_expense_with_installments.sql` | Cria despesa + parcelas **num único passo** (não fica pela metade se der erro). O formulário **ainda não usa** — aplicar SQL sozinho não muda a tela. |

---

## Fechamento parcial — 2026-08-12

**Fechados neste ciclo (além de 08-11):** #25 residual CSV mês.

**Ainda abertos (não dar OK geral):** #7–9, #16, #23–24, #26–29, #31; #32 adiado (Pro); closing/multi-cartão → v1.0; SQL Aug12 no repo **não aplicada** no live; `rooms`/`tasks` órfãs.

**Prova SQL live (MCP 2026-08-12):** `create_expense_with_installments` **não** existe no banco; advisor: `search_path` mutável + leaked password off (Pro).

---

## ❌ CANCELADO

- ~~Galeria Antes e Depois~~ — fora da proposta (2026-06-24)
- ~~UI Cômodos / Diário de Obras~~ — removida do produto; tabelas órfãs no banco
