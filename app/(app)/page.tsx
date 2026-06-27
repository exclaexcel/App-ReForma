import { createClient } from "@/lib/supabase/server";
import { getLatestProject } from "@/lib/queries/getProject";
import { CreateFirstProject } from "@/components/create-first-project";
import { ExpenseListItem } from "@/components/expense-list-item";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlusCircle, Settings, AlertCircle, HardHat as HatIcon } from "lucide-react";
import Link from "next/link";
import { formatCurrency, getDocStatus } from "@/lib/utils";
import type { Expense } from "@/lib/types";

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
            Controle financeiro completo para a sua reforma. Acompanhe despesas, comprovantes e o
            prazo da obra, tudo num só lugar.
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

  const project = await getLatestProject(supabase, user.id);
  const userName = user.user_metadata?.full_name?.split(" ")[0] ?? "Usuário";

  if (!project) {
    return <CreateFirstProject userId={user.id} />;
  }

  // Fetch expenses
  const { data: allExpensesData } = await supabase
    .from("expenses")
    .select("*, categories(id, name, color_hex)")
    .eq("project_id", project.id)
    .eq("status", "ativo")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  const allExpenses = (allExpensesData ?? []) as Expense[];

  // Calculate financials
  const totalCommitted = allExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
  const totalPaid = allExpenses.reduce(
    (sum: number, e: Expense) => (e.is_paid ? sum + e.amount : sum),
    0
  );
  const toPay = totalCommitted - totalPaid;
  const toPayCount = allExpenses.filter((e: Expense) => !e.is_paid).length;
  const saldoDisponivel = project.total_budget - totalCommitted;
  const pctUsado = Math.min((totalCommitted / project.total_budget) * 100, 100);
  const barColor =
    pctUsado >= 100 ? "bg-red-500" : pctUsado >= 80 ? "bg-amber-500" : "bg-emerald-500";

  // Timeline
  const daysUntilEnd = project.end_date
    ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const timelineText =
    project.start_date && project.end_date
      ? (() => {
          const startDate = new Date(project.start_date);
          const endDate = new Date(project.end_date);
          const startFormatted = startDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          });
          const endFormatted = endDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          });

          if (daysUntilEnd === null) {
            return `Iniciada ${startFormatted} · Prazo ${endFormatted}`;
          }

          if (daysUntilEnd < 0) {
            return `Iniciada ${startFormatted} · Prazo ${endFormatted} · Em atraso há ${Math.abs(daysUntilEnd)} dias`;
          }

          if (daysUntilEnd === 0) {
            return `Iniciada ${startFormatted} · Prazo ${endFormatted} · Prazo é hoje`;
          }

          return `Iniciada ${startFormatted} · Prazo ${endFormatted} · ${daysUntilEnd} dias restantes`;
        })()
      : null;

  const timelineColor =
    daysUntilEnd !== null && daysUntilEnd < 0
      ? "text-red-600 dark:text-red-400"
      : daysUntilEnd !== null && daysUntilEnd <= 7
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-500";

  // Document alerts
  const semComprovanteDocs = allExpenses.filter(
    (e: Expense) => getDocStatus(e) === "sem_comprovante"
  ).length;
  const pendenteDocs = allExpenses.filter((e: Expense) => getDocStatus(e) === "pendente").length;
  const divergenciaDocs = allExpenses.filter(
    (e: Expense) => getDocStatus(e) === "divergencia"
  ).length;
  const totalAlertas = semComprovanteDocs + pendenteDocs + divergenciaDocs;

  // Recent expenses
  const recentExpenses = allExpenses.slice(0, 3);

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Header with project info and controls */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Olá, {userName}!</h1>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-200 mt-1">
            {project.name}
          </p>
          {timelineText && <p className={`text-xs mt-1 ${timelineColor}`}>{timelineText}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/projeto/editar"
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            aria-label="Editar projeto"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Saldo Disponível Hero */}
      <div className="space-y-3 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">
          Saldo Disponível
        </p>
        <div
          className={`text-3xl font-bold ${
            saldoDisponivel < 0
              ? "text-red-600 dark:text-red-400"
              : "text-stone-900 dark:text-zinc-100"
          }`}
        >
          {formatCurrency(saldoDisponivel)}
          {saldoDisponivel < 0 && <span className="text-sm ml-2">estourado</span>}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${pctUsado}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            {Math.round(pctUsado)}% do orçamento · de {formatCurrency(project.total_budget)} orçados
          </p>
        </div>
      </div>

      {/* Comprometido + A Pagar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-stone-600 dark:text-zinc-400">Comprometido</p>
          <p className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            {formatCurrency(totalCommitted)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-stone-600 dark:text-zinc-400">A Pagar</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(toPay)}
          </p>
          <p className="text-xs text-stone-500 dark:text-zinc-500">
            {toPayCount} despesa{toPayCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Document alerts (conditional) */}
      {totalAlertas > 0 && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/20 px-4 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {totalAlertas} iten{totalAlertas !== 1 ? "s" : ""} precisam de atenção
              </p>
              <ul className="text-sm text-amber-300/80 mt-2 space-y-1">
                {semComprovanteDocs > 0 && (
                  <li>
                    · {semComprovanteDocs} pago{semComprovanteDocs !== 1 ? "s" : ""} sem comprovante
                  </li>
                )}
                {pendenteDocs > 0 && <li>· {pendenteDocs} com documentação incompleta</li>}
                {divergenciaDocs > 0 && (
                  <li>
                    · {divergenciaDocs} nota{divergenciaDocs !== 1 ? "s" : ""} com divergência de
                    valor
                  </li>
                )}
              </ul>
              <Link
                href="/despesas"
                className="inline-block text-amber-400 text-xs font-medium mt-2 hover:text-amber-300 transition-colors"
              >
                Ver despesas →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Link
        href="/novo"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-700 hover:bg-orange-800 px-4 py-4 text-sm font-semibold text-white active:scale-95 transition-all duration-200 shadow-sm shadow-orange-900/20"
      >
        <PlusCircle className="h-5 w-5" />
        Lançar Nova Despesa
      </Link>

      {/* Recent expenses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
            Últimas Despesas
          </h2>
          {recentExpenses.length > 0 && (
            <Link
              href="/despesas"
              className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              Ver todas →
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 rounded-xl bg-stone-100 dark:bg-zinc-800/50">
            <HatIcon className="h-10 w-10 text-stone-400 dark:text-zinc-500" />
            <p className="text-sm text-stone-600 dark:text-zinc-400">Nenhuma despesa ainda.</p>
            <Link
              href="/novo"
              className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              Clique aqui para adicionar
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
            {recentExpenses.map((expense: Expense) => (
              <ExpenseListItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
