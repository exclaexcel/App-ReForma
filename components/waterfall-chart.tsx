"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type WaterfallItem = {
  name: string;
  value: number;
  start: number;
  color: string;
  isTotal?: boolean;
};

type WaterfallChartProps = {
  budget: number;
  categorySums: { name: string; total: number; color: string }[];
};

type TooltipPayload = {
  payload?: WaterfallItem;
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-stone-900 dark:text-zinc-100">{item.name}</p>
      <p className="text-stone-600 dark:text-zinc-300">{formatCurrency(item.value)}</p>
    </div>
  );
}

export function WaterfallChart({ budget, categorySums }: WaterfallChartProps) {
  let running = budget;
  const items: WaterfallItem[] = [
    { name: "Orçamento", value: budget, start: 0, color: "#3f3f46", isTotal: true },
  ];

  for (const cat of categorySums) {
    const start = running - cat.total;
    items.push({ name: cat.name, value: cat.total, start, color: cat.color });
    running -= cat.total;
  }

  items.push({ name: "Saldo", value: running, start: 0, color: "#10b981", isTotal: true });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={items} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
        <XAxis
          dataKey="name"
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        {/* Invisible bar for positioning */}
        <Bar dataKey="start" stackId="a" fill="transparent" />
        <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
          {items.map((item, i) => (
            <Cell key={i} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
