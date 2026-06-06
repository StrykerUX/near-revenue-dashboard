"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"

function buildPriceTicks(data: TimeSeriesPoint[]): { ticks: number[]; domain: [number, number] } {
  const values = data.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const lo = Math.floor((min - (max - min) * 0.1) * 10) / 10
  const hi = Math.ceil((max + (max - min) * 0.1) * 10) / 10
  const step = Math.ceil(((hi - lo) / 4) * 10) / 10
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((lo + step * i) * 100) / 100)
  return { ticks, domain: [lo, ticks[ticks.length - 1]] }
}

function formatPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

function PriceTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  const d = new Date((label as string) + "T12:00:00Z")
  const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-near-subtle text-xs mb-1">{dateLabel}</p>
      <span className="text-near-green font-semibold">${val.toFixed(3)}</span>
    </div>
  )
}

function formatDayTick(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function PriceLineChart({ data }: { data: TimeSeriesPoint[] }) {
  if (data.length === 0) return null

  // Show a tick every ~2 weeks
  const xTicks = data.filter((_, i) => i % 14 === 0).map((p) => p.date)
  const last = data[data.length - 1]
  const { ticks: yTicks, domain } = buildPriceTicks(data)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 16, right: 56, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={formatDayTick}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={yTicks}
          tickFormatter={formatPrice}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={domain}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          ticks={yTicks}
          tickFormatter={formatPrice}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={domain}
        />
        <Tooltip content={<PriceTooltip />} cursor={{ stroke: "var(--near-border)" }} />
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
        {last && (
          <ReferenceDot
            x={last.date}
            y={last.value}
            r={4}
            fill="var(--near-green)"
            stroke="var(--near-card)"
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
