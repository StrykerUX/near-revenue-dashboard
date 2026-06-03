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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short" })
}

function getBimonthlyTicks(data: TimeSeriesPoint[]): string[] {
  const targets = [4, 6, 8, 10, 0, 2, 4]
  const seen = new Set<number>()
  const ticks: string[] = []
  for (const d of data) {
    const m = new Date(d.date).getMonth()
    if (targets.includes(m) && !seen.has(m)) {
      seen.add(m)
      ticks.push(d.date)
    }
  }
  const last = data[data.length - 1]
  if (new Date(last.date).getMonth() === 4 && !ticks.includes(last.date)) {
    ticks.push(last.date)
  }
  return ticks
}

export function EmissionsLineChart({ data }: EmissionsLineChartProps) {
  const ticks = getBimonthlyTicks(data)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={formatDate}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={[0, 5, 10, 15, 20]}
          tickFormatter={(v) => v === 0 ? "0.0%" : `${v}.0%`}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={[0, 20]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--near-border)" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--near-green)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
