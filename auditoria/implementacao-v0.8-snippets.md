# Snippets de Implementação — v0.8

Referência rápida de código para cada feature do sprint v0.8.

---

## #5 Paginação

### 1. Estado e constante em `despesas/page.tsx`
```ts
const [page, setPage] = useState(0);
const pageSize = 20;
const [hasMore, setHasMore] = useState(true);
```

### 2. Query com paginação
```ts
// ANTES:
const { data: expData } = await supabase
  .from("expenses")
  .select("*, categories(...), rooms(...), suppliers(...)")
  .eq("project_id", project.id)
  .order("expense_date", { ascending: false })

// DEPOIS:
const { data: expData } = await supabase
  .from("expenses")
  .select("*, categories(...), rooms(...), suppliers(...)")
  .eq("project_id", project.id)
  .order("expense_date", { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1)

setHasMore((expData ?? []).length === pageSize)
```

### 3. Botão "Ver mais" na UI
```tsx
{filtered.length > 0 && hasMore && (
  <button
    onClick={() => setPage(p => p + 1)}
    className="w-full py-3 text-sm text-orange-600 hover:text-orange-500 font-medium mt-4"
  >
    Carregar mais (mostrando {filtered.length} de ...)
  </button>
)}
```

**Aplicar em:** `despesas/page.tsx`, `comprovantes/page.tsx`, `fornecedores/page.tsx`, `diario-obras/page.tsx`

---

## #9 Exibir `start_date`

### Em `dashboard/page.tsx`
```ts
// Após calcular daysUntilEnd...
const daysElapsed = project.start_date
  ? Math.floor((Date.now() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))
  : null;
```

### Component novo (ou em CountdownBanner.tsx)
```tsx
{daysElapsed !== null ? (
  <div className="rounded-xl bg-blue-900/30 border border-blue-800 px-4 py-3">
    <p className="text-sm text-blue-400">
      ✓ Obra iniciada há <span className="font-bold">{daysElapsed}</span> dias
      ({new Date(project.start_date!).toLocaleDateString("pt-BR")})
    </p>
  </div>
) : (
  <div className="rounded-xl bg-stone-800/30 border border-stone-700 px-4 py-3">
    <p className="text-sm text-stone-400">
      Data de início não definida. <Link href="/projeto/editar" className="text-orange-600">Configurar</Link>
    </p>
  </div>
)}
```

---

## #11 Estado Cancelado

### Migration `005_add_expense_status.sql`
```sql
-- Adicionar coluna status
ALTER TABLE expenses
ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- Constraint
ALTER TABLE expenses
ADD CONSTRAINT expenses_status_check
CHECK (status IN ('active', 'cancelado'));

-- Index para performance
CREATE INDEX idx_expenses_status ON expenses(status, project_id);
```

### Type Update em `lib/types.ts`
```ts
export interface Expense {
  // ... campos existentes ...
  status: 'active' | 'cancelado';
}
```

### UI Change — Em vez de delete
```ts
// ANTES:
const { error } = await supabase
  .from("expenses")
  .delete()
  .eq("id", expenseId);

// DEPOIS:
const { error } = await supabase
  .from("expenses")
  .update({ status: 'cancelado' })
  .eq("id", expenseId);
```

### Filter em todas as queries
```ts
// ANTES:
.from("expenses")
.select(...)

// DEPOIS:
.from("expenses")
.select(...)
.eq("status", "active")  // <-- ADICIONAR AQUI
```

### Toast
```ts
toast.success("Despesa cancelada (pode ser restaurada)")
```

---

## #18 Badge "Sem Comprovante"

### Em `components/expense-list-item.tsx`
```tsx
import { getDocStatus } from "@/lib/utils"; // já existe

export function ExpenseListItem({ expense, href }: Props) {
  const docStatus = getDocStatus(expense);
  
  const statusConfig = {
    completo: { color: "bg-emerald-900/30 border-emerald-800 text-emerald-400", label: "✓ Documentado" },
    pendente: { color: "bg-yellow-900/30 border-yellow-800 text-yellow-400", label: "⚠ Doc. incompleta" },
    divergencia: { color: "bg-red-900/30 border-red-800 text-red-400", label: "✕ Divergência" },
    sem_regra: { color: "", label: null },
  };
  
  const config = statusConfig[docStatus];

  return (
    <Link href={href} className="flex items-center justify-between py-3 px-3 border-b border-stone-200 dark:border-zinc-800">
      {/* conteúdo existente */}
      
      {/* NOVO: Badge no canto superior direito */}
      {config.label && (
        <div className={`rounded-lg border px-2 py-1 text-xs font-medium ${config.color}`}>
          {config.label}
        </div>
      )}
    </Link>
  );
}
```

---

## #19 Filtro "Pagos Sem Comprovante"

### Em `components/advanced-filters-modal.tsx`
```tsx
const [filters, setFilters] = useState({
  // ... filtros existentes ...
  paidWithoutReceipt: false,
});

return (
  // ... filtros existentes ...
  
  {/* NOVO: Checkbox */}
  <div className="space-y-2">
    <Label className="flex items-center gap-2 cursor-pointer">
      <Checkbox
        checked={filters.paidWithoutReceipt}
        onCheckedChange={(checked) =>
          setFilters(p => ({ ...p, paidWithoutReceipt: !!checked }))
        }
      />
      <span className="text-sm">Pagos sem comprovante</span>
    </Label>
  </div>
);
```

### Em `despesas/page.tsx`
```ts
const [advancedFilters, setAdvancedFilters] = useState({
  // ... existentes ...
  paidWithoutReceipt?: boolean;
});

const filtered = expenses.filter((e) => {
  // ... filtros existentes ...
  
  const matchPaidWithoutReceipt =
    advancedFilters.paidWithoutReceipt === undefined ||
    advancedFilters.paidWithoutReceipt === false ||
    (e.is_paid && !e.receipt_url);

  return (
    // ... todas condições existentes ...
    && matchPaidWithoutReceipt
  );
});
```

---

## #21 Saldo Disponível

### Em `dashboard/page.tsx`
```ts
const saldo = project.total_budget - totalCommitted;
const saldoColor = saldo >= 0 ? "text-emerald-400" : "text-red-400";
const saldoBgColor = saldo >= 0 ? "bg-emerald-900/20 border-emerald-800" : "bg-red-900/20 border-red-800";
```

### Novo KPI Card
```tsx
<KPICard
  label="Saldo disponível"
  value={formatCurrency(saldo)}
  className={`border ${saldoBgColor}`}
  valueClassName={saldoColor}
  subtitle={saldo < 0 ? `⚠ Excedido em ${formatCurrency(Math.abs(saldo))}` : undefined}
/>
```

---

## #22 Total por Cômodo

### Query em `graficos/page.tsx`
```ts
const { data: roomTotals } = await supabase
  .from("expenses")
  .select("rooms(id, name), amount")
  .eq("project_id", project.id)
  .eq("status", "active");

const byRoom = roomTotals?.reduce((acc, e) => {
  const roomName = e.rooms?.name || "Sem cômodo";
  acc[roomName] = (acc[roomName] || 0) + e.amount;
  return acc;
}, {} as Record<string, number>) || {};

// Converter para array para gráfico
const roomData = Object.entries(byRoom)
  .map(([name, amount]) => ({ name, amount }))
  .sort((a, b) => b.amount - a.amount);
```

### Gráfico (usar `horizontal-bar-chart.tsx` existente)
```tsx
<HorizontalBarChart
  data={roomData}
  title="Total por cômodo"
  valueFormatter={(val) => formatCurrency(val)}
/>
```

---

## #23 Total por Fornecedor

### Query similar a #22
```ts
const bySupplier = supplierTotals?.reduce((acc, e) => {
  const supplierName = e.suppliers?.name || "Sem fornecedor";
  acc[supplierName] = (acc[supplierName] || 0) + e.amount;
  return acc;
}, {} as Record<string, number>) || {};

const supplierData = Object.entries(bySupplier)
  .map(([name, amount]) => ({ name, amount }))
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 10); // Top 10 apenas
```

---

## Ordem de Implementação (recomendada)

1. **#9 start_date** (30min) — Menor esforço, máxima visibilidade
2. **#5 Paginação** (2-3h) — Implementar em paralelo em 4 páginas
3. **#11 Estado cancelado** (2h) — Depende de migration, mais complexo
4. **#18 Badge** (45min) — Usa função que já existe
5. **#19 Filtro** (1-1.5h) — Reutiliza padrão existente
6. **#21, #22, #23** (2-3h) — Analytics, prioridade menor

---

**Gerado:** 2026-06-24  
**Última atualização:** Antes de v0.8
