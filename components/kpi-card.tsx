import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
};

const variantStyles = {
  default: "dark:bg-zinc-800 dark:border-zinc-700/60 light:bg-stone-100 light:border-stone-200/60",
  primary: "dark:bg-zinc-700 dark:border-zinc-600/60 light:bg-stone-100 light:border-stone-200/60",
  success: "dark:bg-zinc-800 dark:border-emerald-800/60 light:bg-stone-100 light:border-stone-200/60",
  warning: "dark:bg-zinc-800 dark:border-orange-900/60 light:bg-stone-100 light:border-stone-200/60",
};

const iconStyles = {
  default: "text-zinc-400",
  primary: "text-orange-500",
  success: "text-emerald-500",
  warning: "text-orange-400",
};

export function KpiCard({ label, value, icon: Icon, variant = "default" }: KpiCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4 flex flex-col gap-2 shadow-sm shadow-black/20 transition-all duration-200 group hover:border-zinc-600/80 dark:hover:bg-zinc-700/50 light:hover:bg-stone-200/50",
      variantStyles[variant]
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs dark:text-zinc-400 light:text-stone-600 font-semibold uppercase tracking-wider">{label}</span>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </div>
      <span className="text-xl font-bold dark:text-zinc-100 light:text-stone-900 tabular-nums">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
