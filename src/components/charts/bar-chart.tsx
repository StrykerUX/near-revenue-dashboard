"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts"
import type { RevenueBarPoint } from "@/lib/types"

interface RevenueBarChartProps {
  data: RevenueBarPoint[]
}

const Y_TICKS = [0, 125_000, 250_000, 375_000, 500_000]

function formatY(v: number): string {
  if (v === 0) return "0"
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${v / 1_000}K`
  return `$${v}`
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const monthly = payload.find(p => p.dataKey === "value")?.value ?? 0
  const cumulative = payload.find(p => p.dataKey === "cumulative")?.value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm">
      <p className="text-near-subtle text-xs mb-2">{label}</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--near-green)" }} />
          <span className="text-near-subtle text-xs">Monthly</span>
          <span className="text-near-text font-medium ml-auto">{formatY(monthly as number)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#f97316" }} />
          <span className="text-near-subtle text-xs">Cumulative</span>
          <span className="text-near-text font-medium ml-auto">{formatY(cumulative as number)}</span>
        </div>
      </div>
    </div>
  )
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const xTicks = data.map((d) => d.date)
  const maxCumulative = Math.max(0, ...data.map(d => d.cumulative))
  const cumStep = maxCumulative > 0 ? Math.ceil(maxCumulative / 4 / 100_000) * 100_000 : 250_000
  const cumTicks = [0, cumStep, cumStep * 2, cumStep * 3, cumStep * 4]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="28%">
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
          ticks={cumTicks}
          tickFormatter={formatY}
          tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
          domain={[0, cumTicks[4]]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={800} animationEasing="ease-out">
          {data.map((_, index) => (
            <Cell key={index} fill="var(--near-green)" fillOpacity={1} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f97316", stroke: "var(--near-card)", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
