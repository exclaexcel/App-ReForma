"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDateBR } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

type DailyPoint = { date: string; total: number };

type SpendingTrendChartProps = {
  dailyData: DailyPoint[];
};

type ChartPoint = { key: string; label: string; total: number };

function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`;
}

function findPeak(points: ChartPoint[]): ChartPoint | null {
  if (points.length === 0) return null;
  return points.reduce((max, p) => (p.total > max.total ? p : max), points[0]);
}

type TooltipPayload = { payload?: ChartPoint };

function CustomTooltip({
  active,
  payload,
  isDaily,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  isDaily: boolean;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-stone-900 dark:text-zinc-100">
        {isDaily ? formatDateBR(item.key) : item.label}
      </p>
      <p className="text-stone-600 dark:text-zinc-300">{formatCurrency(item.total)}</p>
    </div>
  );
}

export function SpendingTrendChart({ dailyData }: SpendingTrendChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthlyPoints = useMemo<ChartPoint[]>(() => {
    const map = new Map<string, number>();
    for (const d of dailyData) {
      const key = monthKey(d.date);
      map.set(key, (map.get(key) ?? 0) + d.total);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({ key, label: monthLabel(key), total }));
  }, [dailyData]);

  const dailyPoints = useMemo<ChartPoint[]>(() => {
    if (!selectedMonth) return [];
    return dailyData
      .filter((d) => monthKey(d.date) === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ key: d.date, label: formatDateBR(d.date).slice(0, 5), total: d.total }));
  }, [dailyData, selectedMonth]);

  const points = selectedMonth ? dailyPoints : monthlyPoints;
  const peak = findPeak(points);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-600 dark:text-zinc-500">
          {peak &&
            (selectedMonth
              ? `Maior gasto do mês: ${formatDateBR(peak.key)} — ${formatCurrency(peak.total)}`
              : `Maior gasto: ${peak.label} — ${formatCurrency(peak.total)}`)}
        </p>
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth(null)}
            className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline shrink-0"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={points}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          onClick={(e) => {
            if (selectedMonth || typeof e?.activeIndex !== "string") return;
            const clicked = monthlyPoints[Number(e.activeIndex)];
            if (clicked) setSelectedMonth(clicked.key);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip content={<CustomTooltip isDaily={Boolean(selectedMonth)} />} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#C84B31"
            strokeWidth={2}
            cursor={selectedMonth ? "default" : "pointer"}
            dot={(props) => {
              const { cx, cy, payload, key } = props as unknown as {
                cx: number;
                cy: number;
                payload: ChartPoint;
                key: string;
              };
              const isPeak = peak?.key === payload.key;
              return (
                <Dot
                  key={key}
                  cx={cx}
                  cy={cy}
                  r={isPeak ? 5 : 3}
                  fill={isPeak ? "#C84B31" : "#71717a"}
                  stroke={isPeak ? "#C84B31" : "#71717a"}
                />
              );
            }}
            activeDot={{ r: 6, fill: "#C84B31" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
