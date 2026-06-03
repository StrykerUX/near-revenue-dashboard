"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"

interface FeesAreaChartProps {
  data: TimeSeriesPoint[]
}

function formatY(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
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

export function FeesAreaChart({ data }: FeesAreaChartProps) {
  // Show one label per ~2 months to avoid crowding
  const ticks = data.filter((_, i) => i % 8 === 0).map((d) => d.date)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={formatDate}
          tick={{ fill: "var(--near-subtle)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fill: "var(--near-subtle)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--near-border)" }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--near-green)"
          strokeWidth={2}
          fill="url(#feesGradient)"
          dot={false}
          isAnimationActive={false}
          activeDot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
