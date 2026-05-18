import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/kpi-card";
import { ExpenseListItem } from "@/components/expense-list-item";
import { CreateFirstProject } from "@/components/create-first-project";
import { Wallet, TrendingDown, CheckCircle2, Clock, HardHat } from "lucide-react";
import { Expense } from "@/lib/types";

export default async function HomePage() {
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
    .single();

  const userName = user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário";

  if (!project) {
    return <CreateFirstProject userId={user.id} />;
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, categories(id, name, color_hex)")
    .eq("project_id", project.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  const allExpenses = (expenses ?? []) as Expense[];
  const totalCommitted = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = allExpenses.filter((e) => e.is_paid).reduce((sum, e) => sum + e.amount, 0);
  const toPay = totalCommitted - totalPaid;
  const recentExpenses = allExpenses.slice(0, 5);

  return (
    <div className="px-4 pt-6 space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Início</p>
        <h1 className="text-2xl font-bold text-zinc-100">Olá, {userName}</h1>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{project.name}</p>
      </div>

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
          <h2 className="text-sm font-semibold text-zinc-300">Últimas Despesas</h2>
          {allExpenses.length > 5 && (
            <a href="/despesas" className="text-xs text-orange-500 hover:text-orange-400">
              Ver todas
            </a>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HardHat className="h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              Nenhuma despesa ainda. Toque em{" "}
              <span className="text-orange-500 font-medium">+</span> para adicionar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentExpenses.map((expense) => (
              <ExpenseListItem key={expense.id} expense={expense} href={"/editar/" + expense.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
