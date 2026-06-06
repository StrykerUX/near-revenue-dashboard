"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"

export interface SwapDataPoint {
  date: string
  confidential: number
  normal: number
}

interface StackedBarChartProps {
  data: SwapDataPoint[]
}

const Y_TICKS = [0, 125_000, 250_000, 375_000, 500_000]

function formatY(v: number): string {
  if (v === 0) return "0"
  if (v >= 1_000) return `${v / 1_000}K`
  return String(v)
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span style={{ color: p.color }} className="font-medium">{formatY(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  )
}

export function SwapBreakdownChart({ data }: StackedBarChartProps) {
  const xTicks = data.filter((_, i) => i % 2 === 0).map((d) => d.date)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 44, left: 10, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={(v: string) => v.split(" ")[0]}
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
        <Bar dataKey="confidential" stackId="a" fill="var(--near-green)" radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={800} />
        <Bar dataKey="normal" stackId="a" fill="#F08080" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  )
}
