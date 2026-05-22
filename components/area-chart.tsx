"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type AreaChartDataPoint = {
  label: string;
  total: number;
};

type SpendingAreaChartProps = {
  data: AreaChartDataPoint[];
};

type TooltipPayload = {
  value?: number;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-stone-900 dark:text-zinc-100">{label}</p>
      <p className="text-stone-600 dark:text-zinc-300">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export function SpendingAreaChart({ data }: SpendingAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C84B31" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#C84B31" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#C84B31"
          strokeWidth={2}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
