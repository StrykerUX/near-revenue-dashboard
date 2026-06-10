"use client"

import { useState, useMemo } from "react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import type { IntentVolumePoint } from "@/lib/api"
import { formatDayLabel, debugGlow } from "@/lib/utils"

// ── Constants ──────────────────────────────────────────────────────────────────

const BAR_COLOR  = "#1e3a5f"
const LINE_COLOR = "#ffffff"

const RANGES = ["7D", "30D", "90D", "ALL"] as const
type Range = typeof RANGES[number]

const RANGE_DAYS: Record<Exclude<Range, "ALL">, number> = { "7D": 7, "30D": 30, "90D": 90 }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtMillions(v: number): string {
  if (v === 0) return "$0"
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`
  return `$${(v / 1_000).toFixed(0)}K`
}

function fmtCumulative(v: number): string {
  if (v === 0) return "$0"
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`
  return `$${(v / 1_000).toFixed(0)}K`
}

function fmtFull(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function niceCeil(v: number): number {
  if (v <= 0) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const n = norm <= 1 ? 1 : norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 3 ? 3 : norm <= 3.5 ? 3.5 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10
  return n * mag
}

function makeTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const raw = Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i))
  return [...new Set(raw)]
}

function makeRangeTicks(min: number, max: number, count = 4): number[] {
  const step = (max - min) / count
  return Array.from({ length: count + 1 }, (_, i) => Math.round(min + step * i))
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

type ChartPoint = {
  label: string
  volume_usd: number
  cumulative_volume_usd: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as ChartPoint | undefined
  if (!row) return null
  return (
    <div className="rounded-lg border border-white/10 px-3 py-2 text-xs" style={{ background: "#1a1c1c" }}>
      <p className="text-gray-400 mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: BAR_COLOR }} />
          <span className="text-gray-400">Daily volume</span>
          <span className="ml-auto text-white font-semibold">{fmtFull(row.volume_usd)}</span>
        </div>
        <div className="border-t border-white/10 pt-1 flex items-center gap-2">
          <span className="w-4 h-0.5 shrink-0" style={{ background: LINE_COLOR }} />
          <span className="text-gray-400">Cumulative</span>
          <span className="ml-auto text-white font-medium">{fmtFull(row.cumulative_volume_usd)}</span>
        </div>
      </div>
    </div>
  )
}

// ── X-axis ticks ───────────────────────────────────────────────────────────────

function pickXTicks(data: ChartPoint[], range: Range): string[] {
  const step = range === "7D" ? 1 : range === "30D" ? 2 : range === "90D" ? 5 : 10
  return data.filter((_, i) => i % step === 0).map(d => d.label)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function IntentVolumeSection({ data }: { data: IntentVolumePoint[] }) {
  const [range, setRange] = useState<Range>("30D")

  const view: ChartPoint[] = useMemo(() => {
    if (data.length === 0) return []
    let filtered = data
    if (range !== "ALL") {
      const lastIso = data[data.length - 1].date_at
      const cutoff = new Date(lastIso)
      cutoff.setDate(cutoff.getDate() - (RANGE_DAYS[range] - 1))
      const cutoffIso = cutoff.toISOString().slice(0, 10)
      filtered = data.filter(d => d.date_at >= cutoffIso)
    }
    return filtered.map(d => ({
      label: formatDayLabel(d.date_at),
      volume_usd: d.volume_usd,
      cumulative_volume_usd: d.cumulative_volume_usd,
    }))
  }, [data, range])

  const xTicks = useMemo(() => pickXTicks(view, range), [view, range])

  const { leftTicks, leftDomain, rightTicks, rightDomain } = useMemo(() => {
    if (view.length === 0) {
      return {
        leftTicks: [0], leftDomain: [0, 1] as [number, number],
        rightTicks: [0], rightDomain: [0, 1] as [number, number],
      }
    }

    const maxVol = Math.max(...view.map(d => d.volume_usd))
    const rMax = niceCeil(maxVol * 1.15)
    const rTicks = makeTicks(rMax)

    const minCum = Math.min(...view.map(d => d.cumulative_volume_usd))
    const maxCum = Math.max(...view.map(d => d.cumulative_volume_usd))

    let lDomain: [number, number]
    let lTicks: number[]

    if (range === "ALL" || range === "90D") {
      const lMax = niceCeil(maxCum * 1.05)
      lDomain = [0, lMax]
      lTicks = makeTicks(lMax)
    } else {
      // Non-zero start for 7D/30D to show growth clearly
      const padding = (maxCum - minCum) * 0.15
      const lMin = Math.max(0, minCum - padding)
      const lMax = maxCum + padding
      lDomain = [lMin, lMax]
      lTicks = makeRangeTicks(lMin, lMax)
    }

    return { leftTicks: lTicks, leftDomain: lDomain, rightTicks: rTicks, rightDomain: [0, rMax] as [number, number] }
  }, [view, range])

  const latestCumulative = view.length > 0 ? view[view.length - 1].cumulative_volume_usd : 0

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0e0f0f", ...debugGlow("api") }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Intent Volume</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fmtFull(latestCumulative)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">cumulative all-time</p>
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={
                r === range
                  ? { background: "#00ec97", color: "#0e0f0f" }
                  : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — key forces remount on range change to reset Recharts animation */}
      {view.length > 0 ? (
        <div className="px-2 pb-4">
          <ResponsiveContainer key={`intvol-${range}`} width="100%" height={320}>
            <ComposedChart data={view} margin={{ top: 8, right: 56, left: 10, bottom: 0 }} barCategoryGap="20%">
              <XAxis
                dataKey="label"
                ticks={xTicks}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Left — cumulative */}
              <YAxis
                key="vol-left"
                yAxisId="left"
                orientation="left"
                ticks={leftTicks}
                tickFormatter={fmtCumulative}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
                domain={leftDomain}
              />

              <YAxis key="vol-right" yAxisId="right" orientation="right" hide domain={rightDomain} />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

              <Bar
                yAxisId="right"
                dataKey="volume_usd"
                fill={BAR_COLOR}
                radius={[2, 2, 0, 0]}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cumulative_volume_usd"
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: LINE_COLOR, stroke: "#0e0f0f", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[320px] flex items-center justify-center text-gray-600 text-sm px-6">
          Volume data unavailable
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 pb-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: BAR_COLOR }} />
          <span className="text-xs text-gray-500">Daily swap volume (USD)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 shrink-0" style={{ background: LINE_COLOR }} />
          <span className="text-xs text-gray-500">Cumulative volume</span>
        </div>
      </div>
    </div>
  )
}
