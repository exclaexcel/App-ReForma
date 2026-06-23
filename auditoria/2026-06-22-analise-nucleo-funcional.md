# Análise do Núcleo Funcional — App Reforma
**Data:** 2026-06-22  
**Foco:** comprovantes · notas fiscais · valor investido · tempo de obra · conciliação financeira  
**Evidência:** leitura direta do código — sem suposições

---

# 1. Diagnóstico objetivo

**O app hoje atende parcialmente o objetivo principal.**

O que está funcional de verdade:
- Cadastrar despesas com upload de arquivo (imagem ou PDF)
- Visualizar os arquivos anexados, agrupados por mês
- Ver total comprometido, total pago e total a pagar no dashboard
- Ver breakdown por categoria nos gráficos
- Countdown de dias até o fim da obra

O que ainda impede o app de cumprir sua função central:
- **Não existe campo separado para nota fiscal** — NF e comprovante de pagamento são o mesmo campo (`receipt_url`). O sistema não distingue os dois documentos.
- **Não existe conciliação** entre valor declarado, valor da NF e valor do comprovante — nenhuma lógica compara ou alerta divergências.
- **Pagamentos sem comprovante não são identificados** — o usuário pode lançar qualquer valor sem anexar nada, e o sistema registra normalmente.
- **Não existe visão de tempo de obra real** — o campo `start_date` existe no banco mas não é lido nem exibido em nenhuma tela.
- **Os números do dashboard incluem despesas sem comprovante e sem NF** no total investido, sem nenhum aviso.

---

# 2. Verificação das prioridades principais

---

## 2.1 Comprovantes de pagamento

**Status: PARCIALMENTE PRONTO**

**Evidência no código:**
- `expense-form.tsx` linhas 85–96: upload funciona — bucket `receipts`, path `{uid}/{timestamp}-{filename}`, limite 5MB, aceita imagem e PDF.
- `receipt_url: string | null` (`lib/types.ts` linha 47) — campo opcional, comprovante não é obrigatório.
- `comprovantes/page.tsx` linhas 122–136: signed URL gerado com TTL de 1 hora para visualização.
- `expense-list-item.tsx` linhas 1–69: a lista de despesas **não mostra nenhum indicador** se a despesa tem ou não comprovante.

**Problema encontrado:**
- Comprovante é opcional e não há alerta para despesas pagas sem comprovante.
- A listagem de comprovantes mostra apenas valor, descrição e data — não mostra fornecedor, cômodo, categoria nem forma de pagamento.
- Não é possível filtrar "despesas pagas sem comprovante".

**Impacto prático:**
- Usuário pode marcar 10 despesas como pagas sem anexar nenhum comprovante. O total investido vai crescer normalmente, sem nenhum alerta.
- Na hora de conferir, não há como saber rapidamente quais pagamentos estão documentados e quais não estão.

**Como resolver:**
1. Adicionar badge visual "sem comprovante" na `expense-list-item.tsx` quando `receipt_url` é null e `is_paid` é true.
2. Adicionar filtro "Pagos sem comprovante" na listagem de despesas.
3. Adicionar contador no dashboard: "X pagamentos sem comprovante".

---

## 2.2 Notas fiscais (NF)

**Status: CRÍTICO — não existe como conceito no sistema**

**Evidência no código:**
- `lib/types.ts` linha 47: único campo de arquivo = `receipt_url: string | null`
- `expense-form.tsx` linha 339: label do campo = `"Comprovante (opcional)"`
- `supabase/migrations/` (001, 002, 003): nenhuma migration adiciona coluna para NF.
- `components/supplier-form.tsx`: campos do fornecedor = `name`, `specialty`, `whatsapp`, `budget_url`, `rating`, `notes`. Sem `cnpj`, sem `ie`.

**Problema encontrado:**
NF não existe como entidade no sistema. Não há:
- Campo `invoice_url` ou `nf_url` separado do comprovante de pagamento
- Campo `invoice_number` (número da NF)
- Campo `invoice_value` (valor da NF, que pode diferir do valor pago)
- Campo `nf_key` (chave de acesso)
- CNPJ do emissor vinculado à NF

**Impacto prático:**
- É impossível saber se uma despesa tem NF ou não.
- É impossível conferir se o valor da NF bate com o valor pago.
- O arquivo `receipt_url` pode ser uma foto do recibo, uma NF, um orçamento ou qualquer coisa — o sistema não sabe e não diferencia.
- Para fins de controle fiscal/contábil, o app não oferece nenhuma garantia.

**Como resolver:**
Adicionar à tabela `expenses`:
```sql
invoice_url       text          -- arquivo da NF (separado do comprovante)
invoice_number    text          -- número da NF
invoice_value     numeric       -- valor da NF (pode diferir do valor pago)
has_invoice       boolean DEFAULT false
```
E na UI: campo separado de upload para NF, com label claro.

---

## 2.3 Visão do valor investido

**Status: PARCIALMENTE PRONTO**

**Evidência no código:**
`dashboard/page.tsx` linhas 41–43:
```ts
totalCommitted = allExpenses.reduce((sum, e) => sum + e.amount, 0)
totalPaid      = allExpenses.filter(e => e.is_paid).reduce((sum, e) => sum + e.amount, 0)
toPay          = totalCommitted - totalPaid
```
`graficos/page.tsx` linhas 45–83: total por categoria calculado e exibido. Total por semana calculado e exibido.

**O que existe e funciona:**
- Total comprometido (todos os lançamentos)
- Total efetivamente pago (`is_paid = true`)
- Total a pagar (`comprometido - pago`)
- Breakdown por categoria (valor e % do orçamento)
- Evolução semanal dos gastos

**O que não existe:**
- Saldo restante explícito (`orçamento - comprometido`) — o dashboard mostra orçamento e comprometido separados, mas não calcula a subtração
- Total por fornecedor — nenhuma tela soma despesas por `supplier_id`
- Total por cômodo — `room_id` existe nas despesas mas nunca é agregado
- Total por fase — campo `phase` existe (`"Estrutura"` / `"Mobiliário & Decor"`) mas nunca é agregado
- Curva de investimento acumulado — o gráfico mostra gasto por semana, não acumulado
- Agrupamento mensal — só existe por semana

**Problema encontrado:**
O `totalCommitted` inclui despesas sem comprovante, sem NF e não confirmadas. Um lançamento errado ou duplicado entra imediatamente no total, sem filtro ou aviso.

**Impacto prático:**
O número "total investido" não é auditável — mistura registros documentados com lançamentos sem nenhuma comprovação.

**Como resolver:**
1. Calcular e exibir `saldo = total_budget - totalCommitted` diretamente no dashboard.
2. Adicionar visão "por cômodo" e "por fornecedor" nos gráficos.
3. Separar no dashboard: "confirmados com comprovante" vs "lançados sem documento".

---

## 2.4 Visão do tempo de obra

**Status: CRÍTICO — praticamente inexistente**

**Evidência no código:**
`lib/types.ts` linhas 1–9: campos `start_date: string | null` e `end_date: string | null` existem no modelo.

`dashboard/page.tsx` linhas 46–50:
```ts
daysUntilEnd = Math.ceil(
  (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
)
```
Exibido via `CountdownBanner` — mostra "Faltam X dias", "Hoje é o prazo" ou "Prazo encerrado".

**O que existe:**
- Countdown até a data de fim da obra (se `end_date` estiver preenchido)

**O que não existe:**
- `start_date` existe no banco mas **não é lido nem exibido em nenhuma tela**
- Dias corridos desde o início: não calculado
- Progresso temporal (% do tempo decorrido): não existe
- Etapa atual da obra: não existe como campo — o campo `phase` nas despesas tem apenas dois valores fixos hardcoded
- Comparação planejado vs. realizado: não existe
- Barra de progresso temporal: não existe
- Agenda **não está vinculada financeiramente** — `ScheduleEvent` não tem `expense_id`, `category_id` nem `room_id`

**Impacto prático:**
O usuário sabe quantos dias faltam para o prazo. Não sabe há quantos dias a obra está em andamento, em que fase está, nem se está adiantada ou atrasada em relação ao planejado.

**Como resolver:**
1. Ler e exibir `start_date` no dashboard: "Obra iniciada em X — Y dias em andamento".
2. Calcular e exibir `% do tempo decorrido` entre `start_date` e `end_date`.
3. Adicionar campo `current_phase` ou `current_stage` ao projeto (texto livre ou enum).

---

## 2.5 Conciliação entre pagamentos, NF e saldo investido

**Status: CRÍTICO — não existe nenhuma conciliação**

**Evidência no código:**
- Não há nenhuma função, query ou componente que compare `amount` com qualquer valor de NF.
- `receipt_url` é armazenado mas nunca lido para validação — é apenas uma URL de exibição.
- O modelo não tem campo para valor da NF (`invoice_value`), portanto a comparação é estruturalmente impossível.
- Não há lógica de alerta para: pagamento sem comprovante, despesa sem NF, NF com valor divergente, registros duplicados.

**Impacto prático:**
- Um usuário pode lançar R$ 50.000 em despesas pagas, sem nenhum comprovante e sem nenhuma NF.
- O dashboard vai mostrar "R$ 50.000 efetivamente pagos" com a mesma confiança de um projeto 100% documentado.
- Não há como distinguir os dois cenários pela UI ou pelos dados.

**Como resolver:**
Ver seção "Inconsistências financeiras" abaixo — requer mudança estrutural no modelo de dados.

---

# 3. Inconsistências financeiras e riscos

| Risco | Evidência | Severidade |
|---|---|---|
| `amount` único — sem separação NF/pagamento | `lib/types.ts:46` — um campo só | CRÍTICO |
| `receipt_url` não é validado — pode ser qualquer arquivo | `expense-form.tsx:342` — aceita `image/*,application/pdf` sem mais checks | CRÍTICO |
| Despesa paga sem comprovante não é identificada | `expense-list-item.tsx` — sem badge, sem filtro, sem alerta | CRÍTICO |
| NF não existe como conceito | Nenhum campo `invoice_*` em nenhum arquivo | CRÍTICO |
| `totalCommitted` inclui lançamentos sem documento | `dashboard/page.tsx:41` — soma todos sem filtro | ALTO |
| `is_paid` é booleano sem data do pagamento | `lib/types.ts:46` — sem `paid_at: timestamp` | ALTO |
| Cancelamento apaga histórico | Não existe estado `cancelado` — só delete | ALTO |
| Sem `CHECK amount > 0` no banco | Migrations 001–003 não têm constraint | MÉDIO |
| `start_date` existe mas não é usado | `lib/types.ts:4` — campo ignorado no código | MÉDIO |
| Agenda sem vínculo financeiro | `ScheduleEvent` sem `expense_id` | MÉDIO |

---

# 4. Pendências que realmente importam

1. **Campo separado para nota fiscal** (`invoice_url`, `invoice_number`, `invoice_value`) — sem isso, o app não tem como controlar conformidade documental.

2. **Indicador de "pago sem comprovante"** — badge na listagem, contador no dashboard, filtro dedicado.

3. **Saldo explícito no dashboard** — `orçamento - comprometido` deve ser um KPI visível, não uma conta mental.

4. **Exibição do `start_date`** — dias corridos de obra é informação básica que já existe no banco mas não aparece em lugar nenhum.

5. **Campo `paid_at`** — saber quando um pagamento foi feito é essencial para rastreabilidade. Hoje não existe.

6. **Estado `cancelado` nas despesas** — cancelar sem deletar preserva o histórico, essencial para auditoria.

---

# 5. Itens secundários (importantes, mas não agora)

- Total por fornecedor nos gráficos
- Total por cômodo nos gráficos
- Curva de investimento acumulado (vs. gasto por semana)
- Agrupamento mensal além do semanal
- Etapa atual do projeto como campo editável
- Progresso temporal com barra visual
- Validação de CNPJ do fornecedor
- Agenda vinculada a despesas (`expense_id` em `ScheduleEvent`)
- Testes automatizados (Playwright configurado mas sem arquivos)
- Paginação nas listagens

---

# 6. Próxima milestone recomendada

## v0.5 — "Documentação Confiável"

**Objetivo:** fazer o app ser confiável como ferramenta de guarda de documentos e controle financeiro real.

**Escopo:**

### Banco de dados (migrations)
- Adicionar `invoice_url text`, `invoice_number text`, `invoice_value numeric`, `has_invoice boolean default false` à tabela `expenses`
- Adicionar `paid_at timestamp` à tabela `expenses`
- Adicionar `CHECK (amount > 0)` à tabela `expenses`

### UI — Formulário de despesa
- Separar campo de upload em dois: "Comprovante de pagamento" e "Nota fiscal"
- Exibir `paid_at` (data do pagamento) quando `is_paid = true`

### Dashboard
- Exibir saldo: `orçamento - comprometido`
- Exibir `start_date`: "Obra iniciada há X dias"
- Adicionar contador: "X pagamentos sem comprovante"
- Adicionar contador: "X despesas sem NF"

### Listagem de despesas
- Badge "sem comprovante" quando `is_paid = true` e `receipt_url = null`
- Filtro: "Pagos sem comprovante"

**Estimativa:** 10–14h de desenvolvimento  
**Resultado:** o app passa de "caderno de anotações" para "ferramenta de controle documental confiável"

---

# Checklist — o que falta para o app cumprir sua função principal

- [ ] Campo separado para nota fiscal (estrutura + UI)
- [ ] Campo `invoice_value` para detectar divergência NF vs. pagamento
- [ ] `paid_at` — data em que o pagamento foi realizado
- [ ] Badge/alerta para pagamentos sem comprovante
- [ ] Badge/alerta para despesas sem NF
- [ ] Saldo explícito no dashboard (`orçamento - comprometido`)
- [ ] Exibir `start_date` e dias corridos de obra no dashboard
- [ ] Estado `cancelado` para não apagar histórico

---

# O que precisa existir obrigatoriamente para esse app fazer sentido

1. **Dois campos de arquivo por despesa:** comprovante de pagamento e nota fiscal — são documentos distintos com funções distintas.
2. **Dois campos de valor por despesa:** valor pago e valor da NF — divergência entre eles é um sinal de alerta contábil.
3. **Data do pagamento (`paid_at`):** saber que foi pago não basta — saber quando é essencial para rastreabilidade e conciliação bancária.
4. **Indicador de completude documental:** o sistema precisa conseguir responder "esta despesa está 100% documentada?" com um campo ou cálculo — hoje não consegue.
5. **Saldo disponível no dashboard:** a diferença entre o orçamento e o comprometido é o dado mais importante do app — precisa ser imediato e visível.
6. **Dias corridos de obra:** tempo é o outro eixo de controle — o app precisa mostrar onde está no tempo, não só no orçamento.
