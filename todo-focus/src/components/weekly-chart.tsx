"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="rounded-xl border bg-popover p-3 text-sm shadow-md">
      <p className="mb-2 font-medium">
        {label} · {total} мин
      </p>
      <div className="space-y-1">
        {payload
          .filter((p) => p.value > 0)
          .map((p) => (
            <div key={p.dataKey} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color }}
              />
              <span className="flex-1 text-muted-foreground">{p.dataKey}</span>
              <span className="font-medium">{p.value} мин</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function WeeklyChart() {
  const { categories, weekly } = useStore();

  const data = DAYS.map((day) => {
    const row: Record<string, number | string> = { day };
    categories.forEach((c) => {
      row[c.name] = weekly[day]?.[c.id] ?? 0;
    });
    return row;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.2)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v) => `${v}м`}
          />
          <Tooltip cursor={{ fill: "rgba(120,120,120,0.12)" }} content={<ChartTooltip />} />
          {categories.map((c, i) => (
            <Bar
              key={c.id}
              dataKey={c.name}
              stackId="focus"
              fill={c.color}
              radius={i === categories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive
              animationDuration={700}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
