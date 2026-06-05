"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"

interface FeesAreaChartProps {
  data: TimeSeriesPoint[]
}

function buildYTicks(max: number): number[] {
  const ceil = Math.ceil(max * 1.15)
  const step = Math.ceil(ceil / 4 / 100_000) * 100_000
  return [0, step, step * 2, step * 3, step * 4]
}

function formatY(v: number): string {
  if (v === 0) return "0"
  if (v >= 1_000_000) {
    const n = v / 1_000_000
    return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`
  }
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short" })
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <span className="text-near-green font-medium">{formatY(val)} NEAR</span>
    </div>
  )
}

// Pick the first data point whose month is in the bimonthly set: May, Jul, Sep, Nov, Jan, Mar, May
function getBimonthlyTicks(data: TimeSeriesPoint[]): string[] {
  const targets = [4, 6, 8, 10, 0, 2, 4] // month indices (0=Jan)
  const seen = new Set<number>()
  const ticks: string[] = []
  for (const d of data) {
    const m = new Date(d.date).getMonth()
    if (targets.includes(m) && !seen.has(m)) {
      seen.add(m)
      ticks.push(d.date)
    }
  }
  // Ensure last "May" is the actual last data point if it falls in May
  const last = data[data.length - 1]
  if (new Date(last.date).getMonth() === 4 && !ticks.includes(last.date)) {
    ticks.push(last.date)
  }
  return ticks
}

export function FeesAreaChart({ data }: FeesAreaChartProps) {
  const xTicks = getBimonthlyTicks(data)
  const last = data[data.length - 1]
  const maxVal = data.reduce((m, p) => Math.max(m, p.value), 0)
  const yTicks = buildYTicks(maxVal)
  const yDomain: [number, number] = [0, yTicks[yTicks.length - 1]]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={formatDate}
          tick={{ fill: "var(--near-subtle)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={yTicks}
          tickFormatter={formatY}
          tick={{ fill: "var(--near-subtle)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
          domain={yDomain}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--near-border)" }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--near-green)"
          strokeWidth={2}
          fill="url(#feesGradient)"
          dot={false}
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-out"
          activeDot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
        />
        {last && (
          <ReferenceDot
            x={last.date}
            y={last.value}
            r={5}
            fill="var(--near-green)"
            stroke="var(--near-card)"
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
