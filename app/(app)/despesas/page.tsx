"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExpenseListItem } from "@/components/expense-list-item";
import { Input } from "@/components/ui/input";
import { Expense, Category } from "@/lib/types";
import { Search, SlidersHorizontal, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterPaid, setFilterPaid] = useState<"all" | "paid" | "pending">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

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
        .select("*, categories(id, name, color_hex)")
        .eq("project_id", project.id)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").eq("project_id", project.id).order("name"),
    ]);

    if (expError) throw expError;
    if (catError) throw catError;

      setExpenses((expData ?? []) as Expense[]);
      setCategories(catData ?? []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading despesas:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchPaid =
      filterPaid === "all" ||
      (filterPaid === "paid" && e.is_paid) ||
      (filterPaid === "pending" && !e.is_paid);
    const matchCat = filterCategory === "all" || e.category_id === filterCategory;
    return matchSearch && matchPaid && matchCat;
  });

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Despesas</h1>
        <SlidersHorizontal className="h-5 w-5 text-zinc-500" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar despesa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "paid", "pending"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterPaid(opt)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filterPaid === opt
                ? "bg-orange-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {opt === "all" ? "Todos" : opt === "paid" ? "Pagos" : "A Pagar"}
          </button>
        ))}
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filterCategory === "all"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {filtered.map((expense) => (
            <ExpenseListItem key={expense.id} expense={expense} href={`/despesas/${expense.id}/editar`} />
          ))}
        </div>
      )}
    </div>
  );
}
