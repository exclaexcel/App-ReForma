import { createClient } from "@/lib/supabase/server";
import { getLatestProject } from "@/lib/queries/getProject";
import { CreateFirstProject } from "@/components/create-first-project";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  PlusCircle,
  Settings,
  AlertCircle,
  HardHat as HatIcon,
  FolderOpen,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { ExpenseInstallmentRow } from "@/lib/types";
import {
  formatCurrency,
  formatDateBR,
  getDocStatus,
  getLocalDateString,
  getMonthBounds,
} from "@/lib/utils";

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

  // KPIs need the full installment set (aggregates). List pages use server-side range.
  const { data: allInstallmentsData } = await supabase
    .from("expense_installments_view")
    .select("*, categories(id, name, color_hex)")
    .eq("project_id", project.id);

  const allInstallments = (allInstallmentsData ?? []) as ExpenseInstallmentRow[];

  // Calculate financials based on installments
  const totalCommitted = allInstallments.reduce((sum: number, i) => sum + i.amount, 0);
  const totalPaid = allInstallments.reduce(
    (sum: number, i) => (i.installment_status === "paid" ? sum + i.amount : sum),
    0
  );
  const toPay = totalCommitted - totalPaid;
  const toPayCount = allInstallments.filter((i) => i.installment_status !== "paid").length;
  const saldoDisponivel = project.total_budget - totalCommitted;
  const pctUsado =
    project.total_budget > 0 ? Math.min((totalCommitted / project.total_budget) * 100, 100) : 0;
  const barColor =
    pctUsado >= 100 ? "bg-red-500" : pctUsado >= 80 ? "bg-amber-500" : "bg-emerald-500";

  const today = getLocalDateString();
  const { from: monthFrom, to: monthTo } = getMonthBounds();
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long" })
    .format(new Date())
    .replace(/^./, (c) => c.toUpperCase());

  const pendingInstallments = allInstallments.filter((i) => i.installment_status !== "paid");
  const overdueInstallments = pendingInstallments.filter((i) => i.is_overdue);
  const overdueTotal = overdueInstallments.reduce((s, i) => s + i.amount, 0);

  const dueThisMonth = pendingInstallments.filter(
    (i) => i.due_date >= monthFrom && i.due_date <= monthTo
  );
  const dueThisMonthTotal = dueThisMonth.reduce((s, i) => s + i.amount, 0);

  const nextDue = [...pendingInstallments]
    .filter((i) => i.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];

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

  // Document alerts (aggregate by expense, not by installment)
  const uniqueExpenses = Array.from(
    new Map(allInstallments.map((i) => [i.expense_id, i])).values()
  ) as typeof allInstallments;
  const semComprovanteDocs = uniqueExpenses.filter(
    (e) =>
      getDocStatus({
        ...e,
        id: e.expense_id,
        is_paid: e.installment_status === "paid",
        amount: e.expense_total_amount,
        invoice_url: e.expense_invoice_url,
        status: e.expense_status,
      }) === "sem_comprovante"
  ).length;
  const pendenteDocs = uniqueExpenses.filter(
    (e) =>
      getDocStatus({
        ...e,
        id: e.expense_id,
        is_paid: e.installment_status === "paid",
        amount: e.expense_total_amount,
        invoice_url: e.expense_invoice_url,
        status: e.expense_status,
      }) === "pendente"
  ).length;
  const divergenciaDocs = uniqueExpenses.filter(
    (e) =>
      getDocStatus({
        ...e,
        id: e.expense_id,
        is_paid: e.installment_status === "paid",
        amount: e.expense_total_amount,
        invoice_url: e.expense_invoice_url,
        status: e.expense_status,
      }) === "divergencia"
  ).length;
  const totalAlertas = semComprovanteDocs + pendenteDocs + divergenciaDocs;

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
            {toPayCount} parcela{toPayCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Fluxo de caixa / próxima fatura */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-700/15 border border-orange-700/25">
            <DollarSign className="h-4 w-4 text-orange-700 dark:text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
              Fluxo de caixa
            </p>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Vencimentos · {monthLabel}
              {project.card_due_day != null ? ` · cartão dia ${project.card_due_day}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 dark:bg-zinc-900/60 px-3 py-2.5">
            <p className="text-xs text-stone-500 dark:text-zinc-500">Este mês a pagar</p>
            <p className="text-base font-bold text-stone-900 dark:text-zinc-100 tabular-nums mt-0.5">
              {formatCurrency(dueThisMonthTotal)}
            </p>
            <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
              {dueThisMonth.length} parcela{dueThisMonth.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 dark:bg-zinc-900/60 px-3 py-2.5">
            <p className="text-xs text-stone-500 dark:text-zinc-500">Atrasadas</p>
            <p
              className={`text-base font-bold tabular-nums mt-0.5 ${
                overdueInstallments.length > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-stone-900 dark:text-zinc-100"
              }`}
            >
              {formatCurrency(overdueTotal)}
            </p>
            <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
              {overdueInstallments.length} parcela
              {overdueInstallments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {nextDue && (
          <p className="text-xs text-stone-600 dark:text-zinc-400 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-500" />
            Próximo: {formatDateBR(nextDue.due_date)} · {formatCurrency(nextDue.amount)}
          </p>
        )}

        {project.card_due_day == null && (
          <Link
            href="/projeto/editar"
            className="block text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            Configure o dia do cartão para o fluxo bater →
          </Link>
        )}

        <div className="flex flex-wrap gap-2 pt-0.5">
          <Link
            href="/despesas?filtro=este_mes"
            className="inline-flex items-center rounded-lg bg-orange-700/10 px-3 py-1.5 text-xs font-semibold text-orange-800 dark:text-orange-400 hover:bg-orange-700/20 transition-colors"
          >
            Ver este mês
          </Link>
          {overdueInstallments.length > 0 && (
            <Link
              href="/despesas?filtro=atrasadas"
              className="inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Ver atrasadas
            </Link>
          )}
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
              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  href="/comprovantes"
                  className="inline-block text-amber-400 text-xs font-medium hover:text-amber-300 transition-colors"
                >
                  Ver comprovantes →
                </Link>
                <Link
                  href="/despesas"
                  className="inline-block text-amber-400 text-xs font-medium hover:text-amber-300 transition-colors"
                >
                  Ver despesas →
                </Link>
              </div>
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

      <Link
        href="/comprovantes"
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200"
      >
        <FolderOpen className="h-5 w-5 text-orange-600 dark:text-orange-500" />
        Pasta Digital de Comprovantes
      </Link>

      <Link
        href="/despesas"
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200"
      >
        Ver despesas
      </Link>
    </div>
  );
}
