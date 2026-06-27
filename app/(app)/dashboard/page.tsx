import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseListItem } from "@/components/expense-list-item";
import { CreateFirstProject } from "@/components/create-first-project";
import { HardHat, Settings, AlertCircle } from "lucide-react";
import { Expense } from "@/lib/types";
import { getDocStatus } from "@/lib/utils";
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
    .eq("status", "ativo")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (expensesError) throw expensesError;

  const allExpenses = (expenses ?? []) as Expense[];
  const totalCommitted = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = allExpenses.filter((e) => e.is_paid).reduce((sum, e) => sum + e.amount, 0);
  const toPay = totalCommitted - totalPaid;
  const recentExpenses = allExpenses.slice(0, 3);

  const pendenteDocs = allExpenses.filter((e) => getDocStatus(e) === "pendente").length;
  const semComprovanteDocs = allExpenses.filter(
    (e) => getDocStatus(e) === "sem_comprovante"
  ).length;
  const divergenciaDocs = allExpenses.filter((e) => getDocStatus(e) === "divergencia").length;
  const totalAlertas = pendenteDocs + semComprovanteDocs + divergenciaDocs;

  const daysUntilEnd = project.end_date
    ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Formatação de moeda
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Saldo disponível e barra de progresso
  const saldoDisponivel = project.total_budget - totalCommitted;
  const pctUsado =
    project.total_budget > 0 ? Math.min((totalCommitted / project.total_budget) * 100, 100) : 0;
  const barColor =
    pctUsado >= 100 ? "bg-red-500" : pctUsado >= 80 ? "bg-amber-500" : "bg-emerald-500";
  const toPayCount = allExpenses.filter((e) => !e.is_paid).length;

  // Timeline consolidada
  const timelineText = (() => {
    const now = Date.now();
    const startStr = project.start_date
      ? new Date(project.start_date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : null;
    const endStr = project.end_date
      ? new Date(project.end_date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : null;
    const daysFromStart = project.start_date
      ? Math.floor((now - new Date(project.start_date + "T00:00:00").getTime()) / 86400000)
      : null;
    const parts: string[] = [];
    if (startStr) parts.push(`Iniciada ${startStr}`);
    if (endStr) parts.push(`Prazo ${endStr}`);
    if (daysUntilEnd !== null) {
      if (daysUntilEnd > 0) parts.push(`${daysUntilEnd} dias restantes`);
      else if (daysUntilEnd === 0) parts.push("Prazo hoje");
      else parts.push(`${Math.abs(daysUntilEnd)} dias em atraso`);
    } else if (daysFromStart !== null) {
      parts.push(`${daysFromStart} dias em andamento`);
    }
    return parts.join(" · ");
  })();

  const timelineColor =
    daysUntilEnd !== null && daysUntilEnd < 0
      ? "text-red-600 dark:text-red-400"
      : daysUntilEnd !== null && daysUntilEnd <= 7
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-500";

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">{project.name}</h1>
          {timelineText && <p className={`text-xs mt-1 ${timelineColor}`}>{timelineText}</p>}
        </div>
        <Link
          href="/projeto/editar"
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Saldo Disponível</p>
          <p
            className={`text-3xl font-bold ${saldoDisponivel < 0 ? "text-red-400" : "text-zinc-100"}`}
          >
            {formatCurrency(Math.abs(saldoDisponivel))}
            {saldoDisponivel < 0 && (
              <span className="text-base font-medium text-red-400 ml-2">estourado</span>
            )}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-700">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${pctUsado}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {pctUsado.toFixed(0)}% do orçamento · de {formatCurrency(project.total_budget)} orçados
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-zinc-400">
            Comprometido{" "}
            <span className="text-zinc-100 font-semibold">{formatCurrency(totalCommitted)}</span>
          </span>
          <span className="text-zinc-400">
            A Pagar <span className="text-orange-400 font-semibold">{formatCurrency(toPay)}</span>
            {toPayCount > 0 && (
              <span className="text-zinc-500 ml-1">
                · {toPayCount} despesa{toPayCount > 1 ? "s" : ""}
              </span>
            )}
          </span>
        </div>
      </div>

      {totalAlertas > 0 && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/20 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {totalAlertas} {totalAlertas === 1 ? "item precisa" : "itens precisam"} de atenção
          </p>
          <ul className="space-y-1 text-xs text-amber-300/80 pl-6">
            {semComprovanteDocs > 0 && (
              <li>
                · {semComprovanteDocs} despesa{semComprovanteDocs > 1 ? "s" : ""} paga
                {semComprovanteDocs > 1 ? "s" : ""} sem comprovante
              </li>
            )}
            {pendenteDocs > 0 && <li>· {pendenteDocs} com documentação incompleta</li>}
            {divergenciaDocs > 0 && <li>· {divergenciaDocs} com divergência de valor na nota</li>}
          </ul>
          <Link href="/despesas" className="text-xs text-amber-400 underline">
            Ver despesas →
          </Link>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-zinc-300">
            Últimas Despesas
          </h2>
          {allExpenses.length > 3 && (
            <Link
              href="/despesas"
              className="text-xs text-orange-700 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              Ver todas
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HardHat className="h-8 w-8 text-stone-300 dark:text-zinc-600" />
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Nenhuma despesa ainda. Toque em{" "}
              <Link
                href="/novo"
                className="text-orange-600 dark:text-orange-500 font-medium underline hover:opacity-80"
              >
                aqui
              </Link>{" "}
              para adicionar.
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
    </div>
  );
}
