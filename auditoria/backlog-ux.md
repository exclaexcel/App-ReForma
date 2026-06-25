# Backlog de UX/Usabilidade — App ReForma

**Gerado em:** 2026-06-24  
**Base:** varredura real do código — sem suposições  
**Evidência:** arquivo + linha citados em cada item

---

## 🔴 CRÍTICO — Quebra de fluxo ou dado perdido

- [ ] **#U1 Delete de cômodo sem confirmação e sem aria-label** — `room-manager.tsx:44` — toque acidental destrói cômodo com tarefas/despesas vinculadas instantaneamente; sem `window.confirm` e sem `aria-label` no botão
- [ ] **#U2 Ausência total de toast/feedback de sucesso** — não existe `sonner`, `useToast` nem nenhum sistema de notificação; criar/editar fornecedor, tarefa ou agenda redireciona em silêncio total
- [ ] **#U3 `schedule-event-form.tsx` — Labels sem `htmlFor` conectado** — `<Label>` presentes nas linhas 116, 130, 153, 166 mas os `<Input>` não têm `id`; leitores de tela e clique no label não funcionam

---

## 🟠 ALTO — Frustração frequente no uso diário

- [ ] **#U4 Criar despesa redireciona para home, não para `/despesas`** — `expense-form.tsx:167` — `router.push("/")` após criar; usuário que quer confirmar o lançamento na lista precisa navegar manualmente
- [ ] **#U5 Empty state de despesas sem CTA** — `despesas/page.tsx:222` — exibe texto e ícone mas sem botão/link "Lançar primeira despesa"; fluxo quebrado em tela vazia
- [ ] **#U6 Empty state de comprovantes sem link** — `comprovantes/page.tsx:165` — instrui "Adicione fotos ao lançar uma despesa" mas sem `<Link>` para `/novo`
- [ ] **#U7 Botões Trash2 com área de toque insuficiente (~28px)** — `expense-form.tsx:211`, `task-form.tsx:117`, `supplier-form.tsx:118` — `className="p-1"` abaixo do mínimo recomendado de 44px; crítico em mobile
- [ ] **#U8 Botões ícone-only sem `aria-label`** — 6 locais afetados: Plus em `diario-obras/page.tsx:98`, Plus em `fornecedores/page.tsx:65`, Trash2 nos 3 formulários, Plus em `schedule-view.tsx:95`, Trash2 em `room-manager.tsx:87`; leitores de tela silenciosos

---

## 🟡 MÉDIO — Inconsistência e polimento

- [ ] **#U9 Diário de Obras e Fornecedores fora da BottomNav e do Hub** — `bottom-nav.tsx` cobre só: `/`, `/despesas`, `/novo`, `/agenda`, `/graficos`; `/diario-obras` e `/fornecedores` não têm acesso direto; Hub (`page.tsx`) também não os lista
- [ ] **#U10 `/dashboard` sem botão de voltar** — `app/(app)/dashboard/page.tsx` — nenhum `ArrowLeft` ou elemento de navegação de retorno no topo; usuário usa botão do sistema
- [ ] **#U11 Formulário de despesa longo sem seções** — `expense-form.tsx` — ~11 campos em sequência linear (valor, descrição, data, categoria, fornecedor, tipo, cômodo, pagamento, comprovante, NF) sem separador ou agrupamento visual
- [ ] **#U12 Conflito de classes de cor nas estrelas de avaliação** — `supplier-form.tsx:201` — `text-zinc-600` e `text-stone-300` aplicados juntos no mesmo elemento sem prefixo dark; estrelas sem avaliação ficam com cor incorreta no modo claro
- [ ] **#U13 Campos obrigatórios sem marcação visual consistente** — apenas `Tipo de Despesa` tem `*` explícito em `expense-form.tsx:309`; `Valor`, `Descrição`, `Data` têm `required` no HTML mas sem indicador visual no `<Label>`
- [ ] **#U14 `window.confirm` nativo nos deletes** — `expense-form.tsx:180`, `task-form.tsx:83`, `supplier-form.tsx:85` — dialog do browser não respeita dark mode, visual inconsistente especialmente em iOS
- [ ] **#U15 `invoiceNumber` sem `inputMode`** — `expense-form.tsx:452` — `type="text"` abre teclado completo; `inputMode="numeric"` abriria teclado numérico mais adequado para número de NF
- [ ] **#U16 `project-edit-form.tsx` não redireciona após salvar** — mensagem de sucesso estática, sem redirect; usuário fica parado na tela de edição (confirmado também no backlog técnico como #14)

---

## 🔵 BAIXO — Polimento fino

- [ ] **#U17 Empty state do dashboard com CTA não clicável** — `dashboard/page.tsx:135` — texto menciona "clique no botão +" mas sem `<Link>` para `/novo`
- [ ] **#U18 Botões SlidersHorizontal, Download, RotateCcw usam `title` em vez de `aria-label`** — `despesas/page.tsx:136-176` — `title` não funciona em touch devices
- [ ] **#U19 Feedback de sucesso na edição de projeto é estático** — `project-edit-form.tsx:106` — bloco verde inline não desaparece automaticamente; sem auto-dismiss

---

## Resumo

| Prioridade | Qtd |
|---|---|
| 🔴 Crítico | 3 |
| 🟠 Alto | 5 |
| 🟡 Médio | 8 |
| 🔵 Baixo | 3 |
| **Total** | **19** |

---

## Referência cruzada com backlog técnico

Os seguintes itens do [backlog-pendencias.md](backlog-pendencias.md) têm sobreposição com UX:

- **#13** (delete Cômodos sem confirmação) = **#U1** aqui
- **#12** (BottomNav não cobre 4 módulos) = **#U9** aqui
- **#14** (Projeto/Editar sem redirect) = **#U16** aqui
