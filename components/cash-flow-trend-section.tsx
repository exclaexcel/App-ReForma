"use client";

import { useState } from "react";
import { SpendingTrendChart } from "@/components/spending-trend-chart";
import { cn } from "@/lib/utils";

type DailyPoint = { date: string; total: number };

type CashFlowTrendSectionProps = {
  allData: DailyPoint[];
  unpaidData: DailyPoint[];
};

export function CashFlowTrendSection({ allData, unpaidData }: CashFlowTrendSectionProps) {
  const [mode, setMode] = useState<"a_pagar" | "todas">("a_pagar");
  const data = mode === "a_pagar" ? unpaidData : allData;

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
      active
        ? "bg-orange-700 text-white border-orange-700"
        : "bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-orange-700/50"
    );

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
            Fluxo de caixa (vencimentos)
          </h2>
          <p className="text-xs text-stone-600 dark:text-zinc-500 mt-0.5">
            Quando a parcela vence · toque num ponto para ver os dias
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(mode === "a_pagar")}
          onClick={() => setMode("a_pagar")}
        >
          A pagar
        </button>
        <button
          type="button"
          className={chipClass(mode === "todas")}
          onClick={() => setMode("todas")}
        >
          Todas
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-zinc-500 py-6 text-center">
          {mode === "a_pagar"
            ? "Nenhuma parcela a pagar com vencimento."
            : "Nenhum vencimento registrado."}
        </p>
      ) : (
        <SpendingTrendChart
          dailyData={data}
          peakLabel={mode === "a_pagar" ? "Maior saída a pagar" : "Maior saída"}
        />
      )}
    </div>
  );
}
