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
  default: "bg-white dark:bg-zinc-800 border-stone-200 dark:border-zinc-700",
  primary: "bg-stone-50 dark:bg-zinc-700 border-stone-300 dark:border-zinc-600",
  success: "bg-white dark:bg-zinc-800 border-emerald-200 dark:border-emerald-800",
  warning: "bg-white dark:bg-zinc-800 border-orange-200 dark:border-orange-900",
};

const iconStyles = {
  default: "text-stone-400 dark:text-zinc-400",
  primary: "text-orange-600 dark:text-orange-500",
  success: "text-emerald-500",
  warning: "text-orange-500 dark:text-orange-400",
};

export function KpiCard({ label, value, icon: Icon, variant = "default" }: KpiCardProps) {
  return (
    <div className={cn("rounded-2xl border p-4 flex flex-col gap-2", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500 dark:text-zinc-400 font-medium uppercase tracking-wide">{label}</span>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </div>
      <span className="text-xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
