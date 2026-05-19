import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { days: number };

export function CountdownBanner({ days }: Props) {
  const isOverdue = days < 0;
  const isToday = days === 0;

  const bannerStyle = cn(
    "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all duration-200",
    isOverdue
      ? "bg-red-50 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/50 text-red-700 dark:text-red-400 shadow-red-900/10"
      : isToday
        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 shadow-amber-900/10"
        : "bg-orange-50 dark:bg-zinc-800 border-orange-200/60 dark:border-zinc-700/60 text-orange-800 dark:text-orange-300 shadow-orange-900/10 dark:shadow-black/20"
  );

  const absDays = Math.abs(days);
  const dayWord = absDays === 1 ? "dia" : "dias";
  const message = isOverdue
    ? `Prazo encerrado há ${absDays} ${dayWord}`
    : isToday
      ? "Hoje é o prazo de conclusão!"
      : `Faltam ${days} ${dayWord} para a conclusão`;

  return (
    <div className={bannerStyle}>
      <CalendarDays className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
