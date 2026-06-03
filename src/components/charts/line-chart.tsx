"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"

interface EmissionsLineChartProps {
  data: TimeSeriesPoint[]
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      <span className="text-near-green font-medium">{val.toFixed(1)}%</span>
    </div>
  )
}

export function EmissionsLineChart({ data }: EmissionsLineChartProps) {
  const ticks = data.filter((_, i) => i % 8 === 0).map((d) => d.date)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={[0, 22]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--near-border)" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--near-green)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
