"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ExpenseListItem } from "@/components/expense-list-item";
import { Input } from "@/components/ui/input";
import { Expense, Category, ExpenseType } from "@/lib/types";
import { Search, SlidersHorizontal, ClipboardList, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";
import { AdvancedFiltersModal } from "@/components/advanced-filters-modal";

function exportToCsv(expenses: Expense[]) {
  const headers = ["Data", "Descrição", "Categoria", "Cômodo", "Fornecedor", "Valor (R$)", "Forma de Pagamento", "Status", "Comprovante"];
  const rows = expenses.map((e) => [
    e.expense_date,
    e.description,
    e.categories?.name ?? "",
    e.rooms?.name ?? "",
    e.suppliers?.name ?? "",
    e.amount.toFixed(2).replace(".", ","),
    PAYMENT_METHOD_LABELS[e.payment_method] ?? e.payment_method,
    e.is_paid ? "Pago" : "A Pagar",
    e.receipt_url ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `despesas_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    expenseType?: ExpenseType;
    isPaid?: boolean | null;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const [{ data: expData, error: expError }, { data: catData, error: catError }] = await Promise.all([
      supabase
        .from("expenses")
        .select("*, categories(id, name, color_hex), rooms(id, name), suppliers(id, name)")
        .eq("project_id", project.id)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").eq("project_id", project.id).order("name"),
    ]);

    if (expError) throw expError;
    if (catError) throw catError;

      setExpenses((expData ?? []) as Expense[]);
      setCategories(catData ?? []);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error loading despesas:", error);
      const message = error instanceof Error ? error.message : "Erro ao carregar despesas. Verifique sua conexão.";
      setError(message);
      setExpenses([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || e.category_id === filterCategory;

    // Advanced filters
    const matchDateFrom = !advancedFilters.dateFrom || e.expense_date >= advancedFilters.dateFrom;
    const matchDateTo = !advancedFilters.dateTo || e.expense_date <= advancedFilters.dateTo;
    const matchAmountMin = advancedFilters.amountMin === undefined || e.amount >= advancedFilters.amountMin;
    const matchAmountMax = advancedFilters.amountMax === undefined || e.amount <= advancedFilters.amountMax;
    const matchExpenseType = !advancedFilters.expenseType || e.expense_type === advancedFilters.expenseType;
    const matchAdvancedPaid =
      advancedFilters.isPaid === undefined ||
      advancedFilters.isPaid === null ||
      e.is_paid === advancedFilters.isPaid;

    return (
      matchSearch &&
      matchCat &&
      matchDateFrom &&
      matchDateTo &&
      matchAmountMin &&
      matchAmountMax &&
      matchExpenseType &&
      matchAdvancedPaid
    );
  });

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Despesas</h1>
        <div className="flex items-center gap-3">
          {filtered.length > 0 && (
            <button
              onClick={() => exportToCsv(filtered)}
              title="Exportar CSV"
              className="text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(true)}
            title="Filtros avançados"
            className="text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar despesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {(search || filterCategory !== "all" || Object.keys(advancedFilters).length > 0) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterCategory("all");
              setAdvancedFilters({});
            }}
            title="Limpar filtros"
            className="text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors p-2"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filterCategory === "all"
              ? "bg-stone-400 dark:bg-zinc-600 text-white"
              : "bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-300 dark:hover:bg-zinc-700"
          )}
        >
          Todas categorias
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id === filterCategory ? "all" : cat.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
              filterCategory === cat.id
                ? "text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            style={
              filterCategory === cat.id
                ? { backgroundColor: cat.color_hex }
                : undefined
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cat.color_hex }}
            />
            {cat.name}
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">Nenhuma despesa encontrada.</p>
          {!search && !filterCategory && !advancedFilters.dateFrom && !advancedFilters.dateTo && advancedFilters.amountMin === undefined && advancedFilters.amountMax === undefined && !advancedFilters.expenseType && advancedFilters.isPaid === undefined && (
            <Link href="/novo" className="mt-2 text-sm text-orange-600 hover:text-orange-500 underline font-medium">
              Lançar primeira despesa
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {filtered.map((expense) => (
            <ExpenseListItem key={expense.id} expense={expense} href={`/despesas/${expense.id}/editar`} />
          ))}
        </div>
      )}

      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />
    </div>
  );
}
