import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/kpi-card";
import { ExpenseListItem } from "@/components/expense-list-item";
import { CountdownBanner } from "@/components/countdown-banner";
import { CreateFirstProject } from "@/components/create-first-project";
import { Wallet, TrendingDown, CheckCircle2, Clock, HardHat, FolderOpen, Settings } from "lucide-react";
import { Expense } from "@/lib/types";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) {
    return <CreateFirstProject userId={user.id} />;
  }

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*, categories(id, name, color_hex)")
    .eq("project_id", project.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (expensesError) throw expensesError;

  const allExpenses = (expenses ?? []) as Expense[];
  const totalCommitted = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = allExpenses.filter((e) => e.is_paid).reduce((sum, e) => sum + e.amount, 0);
  const toPay = totalCommitted - totalPaid;
  const recentExpenses = allExpenses.slice(0, 5);

  const daysUntilEnd = project.end_date
    ? Math.ceil(
        (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div>
        <p className="text-sm text-stone-500 dark:text-zinc-500">Resumo Financeiro</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">{project.name}</h1>
      </div>

      {daysUntilEnd !== null && (
        <CountdownBanner days={daysUntilEnd} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Total Orçado"
          value={project.total_budget}
          icon={Wallet}
          variant="primary"
        />
        <KpiCard
          label="Total Comprometido"
          value={totalCommitted}
          icon={TrendingDown}
          variant="default"
        />
        <KpiCard
          label="Efetivamente Pago"
          value={totalPaid}
          icon={CheckCircle2}
          variant="success"
        />
        <KpiCard
          label="A Pagar (Agendado)"
          value={toPay}
          icon={Clock}
          variant="warning"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-zinc-300">Últimas Despesas</h2>
          {allExpenses.length > 5 && (
            <Link href="/despesas" className="text-xs text-orange-700 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
              Ver todas
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HardHat className="h-8 w-8 text-stone-300 dark:text-zinc-600" />
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Nenhuma despesa ainda. Toque em{" "}
              <span className="text-orange-600 dark:text-orange-500 font-medium">+</span> para adicionar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-zinc-800">
            {recentExpenses.map((expense) => (
              <ExpenseListItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4">
        <Link
          href="/comprovantes"
          className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-3 text-sm font-medium text-stone-900 dark:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <FolderOpen className="h-4 w-4 text-orange-700 dark:text-orange-500 shrink-0" />
          Pasta Digital
        </Link>
        <Link
          href="/projeto/editar"
          className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-3 text-sm font-medium text-stone-900 dark:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Settings className="h-4 w-4 text-orange-700 dark:text-orange-500 shrink-0" />
          Editar Obra
        </Link>
      </div>
    </div>
  );
}
