import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/kpi-card";
import { ExpenseListItem } from "@/components/expense-list-item";
import { CreateFirstProject } from "@/components/create-first-project";
import { CountdownBanner } from "@/components/countdown-banner";
import { LogoutButton } from "@/components/logout-button";
import { Wallet, TrendingDown, CheckCircle2, Clock, HardHat, LayoutGrid, Settings, HardHat as HatIcon } from "lucide-react";
import { Expense } from "@/lib/types";
import Link from "next/link";

function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-stone-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-700/10 border border-orange-700/20 shadow-sm shadow-orange-900/10">
              <HatIcon className="h-8 w-8 text-orange-700 dark:text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            App Reforma
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 leading-relaxed">
            Controle financeiro completo para a sua reforma. Acompanhe despesas, comprovantes e o prazo da obra, tudo num só lugar.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-800 active:scale-95 transition-all duration-200 shadow-sm shadow-orange-900/20"
          >
            Criar minha conta
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border border-stone-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200 shadow-sm shadow-black/10"
          >
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  const daysUntilEnd = project.end_date
    ? Math.ceil(
        (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold dark:text-zinc-500 light:text-stone-500 uppercase tracking-wider">Início</p>
          <h1 className="text-3xl font-bold dark:text-zinc-100 light:text-stone-900">Olá, {userName}</h1>
          <p className="text-xs dark:text-zinc-500 light:text-stone-500 mt-0.5 truncate">{project.name}</p>
        </div>
        <LogoutButton />
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

      <div className="flex gap-2">
        <Link
          href="/comodos"
          className="flex-1 flex items-center gap-2 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 light:bg-stone-100 light:border-stone-200 light:text-stone-700 border px-3 py-3 text-sm font-medium dark:hover:bg-zinc-700 light:hover:bg-stone-200 transition-all duration-200"
        >
          <LayoutGrid className="h-4 w-4 text-orange-500 shrink-0" />
          Cômodos
        </Link>
        <Link
          href="/projeto/editar"
          className="flex-1 flex items-center gap-2 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 light:bg-stone-100 light:border-stone-200 light:text-stone-700 border px-3 py-3 text-sm font-medium dark:hover:bg-zinc-700 light:hover:bg-stone-200 transition-all duration-200"
        >
          <Settings className="h-4 w-4 text-orange-500 shrink-0" />
          Editar obra
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold dark:text-zinc-300 light:text-stone-700">Últimas Despesas</h2>
          {allExpenses.length > 5 && (
            <a href="/despesas" className="text-xs text-orange-500 hover:text-orange-400 transition-colors duration-150">
              Ver todas
            </a>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HardHat className="h-8 w-8 dark:text-zinc-600 light:text-stone-400" />
            <p className="text-sm dark:text-zinc-500 light:text-stone-600">
              Nenhuma despesa ainda. Toque em{" "}
              <span className="text-orange-500 font-medium">+</span> para adicionar.
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-zinc-800/40 light:divide-stone-200/40">
            {recentExpenses.map((expense) => (
              <ExpenseListItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
