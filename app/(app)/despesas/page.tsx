"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";

const PAGE_SIZE = 20;
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ExpenseListItem } from "@/components/expense-list-item";
import { Input } from "@/components/ui/input";
import { ExpenseInstallmentRow, ExpenseType } from "@/lib/types";
import { Search, SlidersHorizontal, ClipboardList, RotateCcw } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";
import { AdvancedFiltersModal } from "@/components/advanced-filters-modal";
import { getLocalDateString } from "@/lib/utils";

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

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `despesas_${getLocalDateString()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<ExpenseInstallmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    expenseType?: ExpenseType;
    isPaid?: boolean | null;
    semComprovante?: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchData = useCallback(async () => {
    try {
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

      const { data: expData, error: expError } = await supabase
        .from("expense_installments_view")
        .select("*, categories(id, name, color_hex), suppliers(id, name)")
        .eq("project_id", project.id)
        .order("due_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (expError) throw expError;

      setExpenses((expData ?? []) as ExpenseInstallmentRow[]);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error loading despesas:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar despesas. Verifique sua conexão.";
      setError(message);
      setExpenses([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, advancedFilters]);

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());

    // Advanced filters
    const matchDateFrom = !advancedFilters.dateFrom || e.expense_date >= advancedFilters.dateFrom;
    const matchDateTo = !advancedFilters.dateTo || e.expense_date <= advancedFilters.dateTo;
    const matchAmountMin =
      advancedFilters.amountMin === undefined || e.amount >= advancedFilters.amountMin;
    const matchAmountMax =
      advancedFilters.amountMax === undefined || e.amount <= advancedFilters.amountMax;
    const matchExpenseType =
      !advancedFilters.expenseType || e.expense_type === advancedFilters.expenseType;
    const matchAdvancedPaid =
      advancedFilters.isPaid === undefined ||
      advancedFilters.isPaid === null ||
      (e.installment_status === "paid") === advancedFilters.isPaid;
    const matchSemComprovante =
      !advancedFilters.semComprovante || (e.installment_status === "paid" && !e.receipt_url);

    return (
      matchSearch &&
      matchDateFrom &&
      matchDateTo &&
      matchAmountMin &&
      matchAmountMax &&
      matchExpenseType &&
      matchAdvancedPaid &&
      matchSemComprovante
    );
  });

  const paginated = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Formatação
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Filtros ativos
  const hasAdvancedFilters = Object.keys(advancedFilters).some(
    (key) => advancedFilters[key as keyof typeof advancedFilters] !== undefined
  );

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
            hasAdvancedFilters ? "bg-orange-900/30 text-orange-600 dark:text-orange-400" : ""
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {hasAdvancedFilters && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
        {(search || hasAdvancedFilters) && (
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

      {/* Mini-sumário */}
      <div className="space-y-1 text-sm text-stone-600 dark:text-zinc-400">
        <p>
          {filtered.length} parcela{filtered.length !== 1 ? "s" : ""} ·{" "}
          {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
        </p>
        {filtered.filter((e) => e.installment_status !== "paid").length > 0 && (
          <p>
            ⏱{" "}
            {formatCurrency(
              filtered
                .filter((e) => e.installment_status !== "paid")
                .reduce((s, e) => s + e.amount, 0)
            )}{" "}
            a pagar · {filtered.filter((e) => e.installment_status !== "paid").length} parcela
            {filtered.filter((e) => e.installment_status !== "paid").length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span>
            {filtered.length} {filtered.length === 1 ? "parcela" : "parcelas"}
          </span>
          <div className="flex gap-4">
            <span className="tabular-nums font-mono">
              {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
            </span>
            {filtered.filter((e) => e.installment_status !== "paid").length > 0 && (
              <span className="text-orange-400 tabular-nums font-mono">
                ⏱{" "}
                {formatCurrency(
                  filtered
                    .filter((e) => e.installment_status !== "paid")
                    .reduce((s, e) => s + e.amount, 0)
                )}{" "}
                a pagar
              </span>
            )}
          </div>
        </div>
      )}

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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">Nenhuma despesa encontrada.</p>
          {!search &&
            !advancedFilters.dateFrom &&
            !advancedFilters.dateTo &&
            advancedFilters.amountMin === undefined &&
            advancedFilters.amountMax === undefined &&
            !advancedFilters.expenseType &&
            advancedFilters.isPaid === undefined && (
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
            {paginated.map((expense) => (
              <ExpenseListItem
                key={expense.installment_id}
                expense={expense}
                href={`/despesas/${expense.expense_id}/editar`}
                onUpdate={fetchData}
              />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full py-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Carregar mais ({filtered.length - visibleCount} restantes)
            </button>
          )}
        </div>
      )}

      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onExport={() => exportToCsv(filtered)}
      />
    </div>
  );
}
