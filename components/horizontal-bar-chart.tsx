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

type HorizontalBarChartProps = {
  data: { name: string; total: number; color: string }[];
};

type TooltipPayload = {
  payload?: { name: string; total: number; color: string };
  value?: number;
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-zinc-100">{item?.payload?.name}</p>
      <p className="text-zinc-300">{formatCurrency(item?.value ?? 0)}</p>
    </div>
  );
}

export function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const sorted = [...data].sort((a, b) => b.total - a.total);

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 44)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#a1a1aa", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {sorted.map((item, i) => (
            <Cell key={i} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
