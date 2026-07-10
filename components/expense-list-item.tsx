import { ExpenseInstallmentRow, DOC_STATUS_LABELS } from "@/lib/types";
import { formatCurrency, formatDate, getDocStatus } from "@/lib/utils";
import { Hammer, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ExpenseListItemProps = {
  expense: ExpenseInstallmentRow;
  href?: string;
};

export function ExpenseListItem({ expense, href }: ExpenseListItemProps) {
  const categoryColor = expense.categories?.color_hex ?? "#C84B31";
  const docStatus = getDocStatus({
    ...expense,
    id: expense.expense_id,
    is_paid: expense.installment_status === "paid",
    amount: expense.expense_total_amount,
    invoice_url: expense.expense_invoice_url,
    status: expense.expense_status,
  });
  const sharedClass =
    "w-full flex items-center gap-3 py-3 text-left rounded-xl px-2 transition-all duration-200 active:scale-95 border-b dark:border-zinc-800/40 border-stone-200/40 dark:hover:bg-zinc-800/50 light:hover:bg-stone-100/30 dark:active:bg-zinc-800 light:active:bg-stone-100";

  const content = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${categoryColor}22`, border: `1.5px solid ${categoryColor}55` }}
      >
        <Hammer className="h-4 w-4" style={{ color: categoryColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium dark:text-zinc-100 text-stone-900 truncate">
            {expense.description}
          </p>
          {expense.total_installments && expense.total_installments > 1 && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
              {expense.installment_number}/{expense.total_installments}
            </span>
          )}
        </div>
        <p className="text-xs dark:text-zinc-500 text-stone-500 truncate">
          {expense.categories?.name ?? "Sem categoria"}
          {expense.suppliers?.name && (
            <span className="dark:text-zinc-600 text-stone-400"> · {expense.suppliers.name}</span>
          )}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-sm font-semibold dark:text-zinc-100 text-stone-900 tabular-nums">
          {formatCurrency(expense.amount)}
        </span>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className="text-xs dark:text-zinc-500 text-stone-500">
              {formatDate(expense.due_date)}
            </span>
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                expense.installment_status === "paid"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : expense.is_overdue
                    ? "text-red-600 dark:text-red-400"
                    : "text-orange-600 dark:text-orange-400"
              )}
            >
              {expense.installment_status === "paid" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : expense.is_overdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {expense.installment_status === "paid"
                ? "Pago"
                : expense.is_overdue
                  ? "Atrasado"
                  : "A Pagar"}
            </span>
          </div>
          {docStatus !== "sem_regra" && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                docStatus === "completo" &&
                  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                docStatus === "pendente" && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                docStatus === "sem_comprovante" &&
                  "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                docStatus === "divergencia" && "bg-red-500/20 text-red-600 dark:text-red-400"
              )}
            >
              {(docStatus === "pendente" ||
                docStatus === "divergencia" ||
                docStatus === "sem_comprovante") && <AlertCircle className="h-3 w-3" />}
              {DOC_STATUS_LABELS[docStatus]}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const finalHref = href
    ? href.replace(/\/despesas\/[^/]+/, `/despesas/${expense.expense_id}`)
    : undefined;

  if (finalHref) {
    return (
      <Link href={finalHref} className={sharedClass}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClass}>{content}</div>;
}
