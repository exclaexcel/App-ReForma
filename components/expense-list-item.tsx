import { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Hammer, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ExpenseListItemProps = {
  expense: Expense;
  href?: string;
};

export function ExpenseListItem({ expense, href }: ExpenseListItemProps) {
  const categoryColor = expense.categories?.color_hex ?? "#C84B31";
  const sharedClass =
    "w-full flex items-center gap-3 py-3 text-left rounded-xl px-2 transition-all duration-200 active:scale-95 border-b dark:border-zinc-800/40 light:border-stone-200/40 dark:hover:bg-zinc-800/50 light:hover:bg-stone-100/30 dark:active:bg-zinc-800 light:active:bg-stone-100";

  const content = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${categoryColor}22`, border: `1.5px solid ${categoryColor}55` }}
      >
        <Hammer className="h-4 w-4" style={{ color: categoryColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium dark:text-zinc-100 light:text-stone-900 truncate">{expense.description}</p>
        <p className="text-xs dark:text-zinc-500 light:text-stone-500 truncate">
          {expense.categories?.name ?? "Sem categoria"}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-sm font-semibold dark:text-zinc-100 light:text-stone-900 tabular-nums">
          {formatCurrency(expense.amount)}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs dark:text-zinc-500 light:text-stone-500">{formatDate(expense.expense_date)}</span>
          <span
            className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              expense.is_paid ? "text-emerald-400" : "text-orange-400"
            )}
          >
            {expense.is_paid ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {expense.is_paid ? "Pago" : "A Pagar"}
          </span>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClass}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClass}>{content}</div>;
}
