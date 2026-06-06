"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"

interface RevenueBarChartProps {
  data: TimeSeriesPoint[]
}

const Y_TICKS = [0, 125_000, 250_000, 375_000, 500_000]

function formatY(v: number): string {
  if (v === 0) return "0"
  if (v >= 1_000) return `${v / 1_000}K`
  return String(v)
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      <span className="text-near-green font-medium">{formatY(val)} NEAR</span>
    </div>
  )
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const xTicks = data.map((d) => d.date)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 44, left: 10, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={(v: string) => v.split(" ")[0]} // "Apr '25" → "Apr"
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={Y_TICKS}
          tickFormatter={formatY}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={[0, 500_000]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          ticks={Y_TICKS}
          tickFormatter={formatY}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={[0, 500_000]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
          {data.map((_, index) => (
            <Cell key={index} fill="var(--near-green)" fillOpacity={1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
