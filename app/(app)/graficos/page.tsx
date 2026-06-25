import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLatestProject } from "@/lib/queries/getProject";
import { WaterfallChart } from "@/components/waterfall-chart";
import { HorizontalBarChart } from "@/components/horizontal-bar-chart";
import { SpendingAreaChart } from "@/components/area-chart";
import { formatCurrency } from "@/lib/utils";
import { Expense, Category } from "@/lib/types";

type CategorySum = {
  name: string;
  total: number;
  color: string;
  percentage: number;
};

type WeeklyData = {
  label: string;
  total: number;
};

export default async function GraficosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getLatestProject(supabase, user.id);

  if (!project) redirect("/");

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*, categories(id, name, color_hex)")
    .eq("project_id", project.id)
    .eq("status", "ativo")
    .order("expense_date", { ascending: true });

  if (expensesError) throw expensesError;

  const allExpenses = (expenses ?? []) as Expense[];
  const totalCommitted = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = new Map<string, { name: string; total: number; color: string }>();
  for (const expense of allExpenses) {
    const cat = expense.categories as Category | null;
    const key = cat?.id ?? "sem_categoria";
    const existing = categoryMap.get(key);
    if (existing) {
      existing.total += expense.amount;
    } else {
      categoryMap.set(key, {
        name: cat?.name ?? "Sem categoria",
        total: expense.amount,
        color: cat?.color_hex ?? "#71717a",
      });
    }
  }

  const categorySums: CategorySum[] = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .map((cat) => ({
      ...cat,
      percentage:
        project.total_budget > 0
          ? Math.round((cat.total / project.total_budget) * 100)
          : 0,
    }));

  const weeklyMap = new Map<string, number>();
  for (const expense of allExpenses) {
    const date = new Date(expense.expense_date + "T00:00:00");
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + expense.amount);
  }

  const weeklyData: WeeklyData[] = Array.from(weeklyMap.entries()).map(([label, total]) => ({
    label,
    total,
  }));

  return (
    <div className="px-4 pt-6 space-y-6 pb-4">
      <div>
        <p className="text-sm text-stone-600 dark:text-zinc-500">Inteligência de dados</p>
        <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Gráficos</h1>
      </div>

      <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Cascata do Orçamento</h2>
          <p className="text-xs text-stone-600 dark:text-zinc-500 mt-0.5">Consumo por categoria</p>
        </div>
        {totalCommitted === 0 ? (
          <p className="text-center text-sm text-stone-600 dark:text-zinc-500 py-8">
            Nenhuma despesa registrada ainda.
          </p>
        ) : (
          <WaterfallChart budget={project.total_budget} categorySums={categorySums} />
        )}
      </div>

      {categorySums.length > 0 && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Tabela de Transparência</h2>
            <p className="text-xs text-stone-600 dark:text-zinc-500 mt-0.5">Peso no orçamento por categoria</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-zinc-700">
                <th className="text-left text-xs font-medium text-stone-600 dark:text-zinc-500 pb-2">Categoria</th>
                <th className="text-right text-xs font-medium text-stone-600 dark:text-zinc-500 pb-2">Total</th>
                <th className="text-right text-xs font-medium text-stone-600 dark:text-zinc-500 pb-2">Peso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
              {categorySums.map((cat) => (
                <tr key={cat.name}>
                  <td className="py-2.5 flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-stone-700 dark:text-zinc-300 text-xs">{cat.name}</span>
                  </td>
                  <td className="py-2.5 text-right text-xs font-medium text-stone-900 dark:text-zinc-100 tabular-nums">
                    {formatCurrency(cat.total)}
                  </td>
                  <td className="py-2.5 text-right text-xs font-medium text-orange-600 dark:text-orange-400 tabular-nums">
                    {cat.percentage}%
                  </td>
                </tr>
              ))}
              <tr className="border-t border-stone-200 dark:border-zinc-700">
                <td className="pt-3 text-xs font-semibold text-stone-700 dark:text-zinc-300">Total gasto</td>
                <td className="pt-3 text-right text-xs font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                  {formatCurrency(totalCommitted)}
                </td>
                <td className="pt-3 text-right text-xs font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                  {project.total_budget > 0
                    ? Math.round((totalCommitted / project.total_budget) * 100)
                    : 0}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {categorySums.length > 0 && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Ranking por Categoria</h2>
            <p className="text-xs text-stone-600 dark:text-zinc-500 mt-0.5">Maiores custos</p>
          </div>
          <HorizontalBarChart data={categorySums} />
        </div>
      )}

      {weeklyData.length > 1 && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Linha do Tempo</h2>
            <p className="text-xs text-stone-600 dark:text-zinc-500 mt-0.5">Gastos por semana</p>
          </div>
          <SpendingAreaChart data={weeklyData} />
        </div>
      )}
    </div>
  );
}
