"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ExpenseListItem } from "@/components/expense-list-item";
import { Input } from "@/components/ui/input";
import { ExpenseInstallmentRow, ExpenseType } from "@/lib/types";
import { Search, SlidersHorizontal, ClipboardList, RotateCcw } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";
import { AdvancedFiltersModal } from "@/components/advanced-filters-modal";
import { getLocalDateString } from "@/lib/utils";

const PAGE_SIZE = 20;

type AdvancedFilters = {
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  expenseType?: ExpenseType;
  isPaid?: boolean | null;
  semComprovante?: boolean;
};

function exportToCsv(expenses: ExpenseInstallmentRow[]) {
  const headers = [
    "Data",
    "Descrição",
    "Parcela",
    "Categoria",
    "Fornecedor",
    "Valor (R$)",
    "Forma de Pagamento",
    "Status",
    "Data de Vencimento",
    "Comprovante",
    "Tipo de Despesa",
    "Nº da Nota",
    "Valor da Nota (R$)",
  ];
  const rows = expenses.map((e) => [
    e.expense_date,
    e.description,
    `${e.installment_number}/${e.total_installments}`,
    e.categories?.name ?? "",
    e.suppliers?.name ?? "",
    e.amount.toFixed(2).replace(".", ","),
    PAYMENT_METHOD_LABELS[e.payment_method] ?? e.payment_method,
    e.installment_status === "paid" ? "Pago" : e.is_overdue ? "Atrasado" : "A Pagar",
    e.due_date,
    e.receipt_url ?? "",
    e.expense_type,
    e.invoice_number ?? "",
    e.invoice_value ? e.invoice_value.toFixed(2).replace(".", ",") : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `despesas_${getLocalDateString()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function hasActiveFilters(search: string, filters: AdvancedFilters) {
  return (
    search.trim().length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.amountMin !== undefined ||
    filters.amountMax !== undefined ||
    !!filters.expenseType ||
    filters.isPaid === true ||
    filters.isPaid === false ||
    !!filters.semComprovante
  );
}

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<ExpenseInstallmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);

        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: project } = await supabase
          .from("projects")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!project) return;

        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from("expense_installments_view")
          .select("*, categories(id, name, color_hex), suppliers(id, name)", {
            count: "exact",
          })
          .eq("project_id", project.id)
          .order("due_date", { ascending: false })
          .order("created_at", { ascending: false });

        const q = debouncedSearch.trim();
        if (q) {
          query = query.ilike("description", `%${q}%`);
        }
        if (advancedFilters.dateFrom) {
          query = query.gte("expense_date", advancedFilters.dateFrom);
        }
        if (advancedFilters.dateTo) {
          query = query.lte("expense_date", advancedFilters.dateTo);
        }
        if (advancedFilters.amountMin !== undefined) {
          query = query.gte("amount", advancedFilters.amountMin);
        }
        if (advancedFilters.amountMax !== undefined) {
          query = query.lte("amount", advancedFilters.amountMax);
        }
        if (advancedFilters.expenseType) {
          query = query.eq("expense_type", advancedFilters.expenseType);
        }
        if (advancedFilters.isPaid === true) {
          query = query.eq("installment_status", "paid");
        } else if (advancedFilters.isPaid === false) {
          query = query.neq("installment_status", "paid");
        }
        if (advancedFilters.semComprovante) {
          query = query.eq("installment_status", "paid").is("receipt_url", null);
        }

        const { data: expData, error: expError, count } = await query.range(from, to);

        if (expError) throw expError;

        const rows = (expData ?? []) as ExpenseInstallmentRow[];
        setExpenses((prev) => (replace ? rows : [...prev, ...rows]));
        setTotalCount(count ?? rows.length);
        setHasMore((count ?? 0) > to + 1);
        setPage(pageIndex);
        setError(null);
      } catch (err) {
        console.error("Error loading despesas:", err);
        const message =
          err instanceof Error ? err.message : "Erro ao carregar despesas. Verifique sua conexão.";
        setError(message);
        if (replace) setExpenses([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, advancedFilters]
  );

  useEffect(() => {
    void fetchPage(0, true);
  }, [fetchPage]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtersActive = hasActiveFilters(search, advancedFilters);
  const unpaidTotal = expenses
    .filter((e) => e.installment_status !== "paid")
    .reduce((s, e) => s + e.amount, 0);
  const unpaidCount = expenses.filter((e) => e.installment_status !== "paid").length;
  const pageTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 dark:text-zinc-500 pointer-events-none" />
          <Input
            placeholder="Buscar despesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setShowAdvancedFilters(true)}
          title="Filtros avançados"
          className={`relative p-2 rounded-lg text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors ${
            filtersActive ? "bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {filtersActive && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
        {filtersActive && (
          <button
            onClick={() => {
              setSearch("");
              setAdvancedFilters({});
            }}
            title="Limpar filtros"
            className="text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors p-2"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-1 text-sm text-stone-600 dark:text-zinc-400">
        <p>
          {totalCount} parcela{totalCount !== 1 ? "s" : ""}
          {expenses.length > 0 && expenses.length < totalCount
            ? ` · mostrando ${expenses.length}`
            : ""}{" "}
          · {formatCurrency(pageTotal)}
          {expenses.length < totalCount ? " (carregadas)" : ""}
        </p>
        {unpaidCount > 0 && (
          <p>
            {formatCurrency(unpaidTotal)} a pagar · {unpaidCount} parcela
            {unpaidCount !== 1 ? "s" : ""} (nas carregadas)
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">Nenhuma despesa encontrada.</p>
          {!filtersActive && (
            <Link
              href="/novo"
              className="mt-2 text-sm text-orange-600 hover:text-orange-500 underline font-medium"
            >
              Lançar primeira despesa
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-zinc-800">
            {expenses.map((expense) => (
              <ExpenseListItem
                key={expense.installment_id}
                expense={expense}
                href={`/despesas/${expense.expense_id}/editar`}
                onUpdate={() => fetchPage(0, true)}
              />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => void fetchPage(page + 1, false)}
              disabled={loadingMore}
              className="w-full py-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {loadingMore
                ? "Carregando…"
                : `Carregar mais (${Math.max(totalCount - expenses.length, 0)} restantes)`}
            </button>
          )}
        </div>
      )}

      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onExport={() => exportToCsv(expenses)}
      />
    </div>
  );
}
