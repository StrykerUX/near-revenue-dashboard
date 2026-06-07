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
import type { TimeSeriesPoint } from "@/lib/types"

// Confidential TVL rendered as daily bars (same series as the area chart —
// /v1/series/confidential-tvl, dune:7586891). This is the TVL *level* per day,
// not daily flow/inflow (the API does not expose a flow field).

function buildTvlTicks(max: number): number[] {
  const ceil = Math.ceil(max * 1.15)
  const unit = ceil > 4_000_000 ? 1_000_000 : ceil > 400_000 ? 100_000 : 10_000
  const step = Math.ceil(ceil / 4 / unit) * unit
  return [0, step, step * 2, step * 3, step * 4]
}

function formatTvl(v: number): string {
  if (v === 0) return "$0"
  if (v >= 1_000_000) {
    const n = v / 1_000_000
    return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`
  }
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

function getMonthlyTicks(data: TimeSeriesPoint[]): string[] {
  const seen = new Set<string>()
  const ticks: string[] = []
  for (const d of data) {
    const key = d.date.slice(0, 7)
    if (!seen.has(key)) {
      seen.add(key)
      ticks.push(d.date)
    }
  }
  return ticks
}

function formatMonthTick(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  const d = new Date((label as string) + "T12:00:00Z")
  const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-near-subtle text-xs mb-1">{dateLabel}</p>
      <span className="text-near-green font-semibold">{formatTvl(val)}</span>
    </div>
  )
}

export function TvlBarChart({ data }: { data: TimeSeriesPoint[] }) {
  if (data.length === 0) return null

  const xTicks = getMonthlyTicks(data)
  const maxVal = data.reduce((m, p) => Math.max(m, p.value), 0)
  const yTicks = buildTvlTicks(maxVal)
  const yDomain: [number, number] = [0, yTicks[yTicks.length - 1]]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 16, right: 60, left: 10, bottom: 0 }} barCategoryGap="12%">
        <defs>
          <linearGradient id="tvlBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.85} />
            <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={formatMonthTick}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={yTicks}
          tickFormatter={formatTvl}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
          domain={yDomain}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          ticks={yTicks}
          tickFormatter={formatTvl}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
          domain={yDomain}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar
          dataKey="value"
          fill="url(#tvlBarGradient)"
          radius={[2, 2, 0, 0]}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
