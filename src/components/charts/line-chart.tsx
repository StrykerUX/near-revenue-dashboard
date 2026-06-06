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
import { formatNear } from "@/lib/utils"

interface EmissionsLineChartProps {
  data: TimeSeriesPoint[]
  mode?: "monthly" | "daily"
}

function MonthlyTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      <span className="text-near-green font-medium">{val.toFixed(2)}%</span>
    </div>
  )
}

function DailyTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      <span className="text-near-green font-medium">{formatNear(val)} NEAR</span>
    </div>
  )
}

function formatMonthTick(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short" })
}

function formatDayTick(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getBimonthlyTicks(data: TimeSeriesPoint[]): string[] {
  if (data.length === 0) return []
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
  return ticks
}

function getMonthlyTicks(data: TimeSeriesPoint[]): string[] {
  if (data.length === 0) return []
  return data.map((p) => p.date)
}

function buildLineTicks(data: TimeSeriesPoint[]): number[] {
  const max = data.reduce((m, p) => Math.max(m, p.value), 0)
  const ceil = Math.ceil(max * 1.15)
  const step = Math.ceil(ceil / 4 / 10) * 10
  return [0, step, step * 2, step * 3, step * 4]
}

export function EmissionsLineChart({ data, mode = "monthly" }: EmissionsLineChartProps) {
  if (data.length === 0) return null

  const isDaily = mode === "daily"
  const ticks = isDaily ? getBimonthlyTicks(data) : getMonthlyTicks(data)
  const yTicks = buildLineTicks(data)
  const yMax = yTicks[yTicks.length - 1]
  const yFmt = isDaily ? (v: number) => formatNear(v) : (v: number) => `${v.toFixed(1)}%`
  const axisWidth = isDaily ? 56 : 48

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: axisWidth, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={isDaily ? formatDayTick : formatMonthTick}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={yTicks}
          tickFormatter={yFmt}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={axisWidth}
          domain={[0, yMax]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          ticks={yTicks}
          tickFormatter={yFmt}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={axisWidth}
          domain={[0, yMax]}
        />
        <Tooltip
          content={isDaily ? <DailyTooltip /> : <MonthlyTooltip />}
          cursor={{ stroke: "var(--near-border)" }}
        />
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
