"use client"

import { useMemo, useState, useEffect } from "react"
import { useGlobalRange, type GlobalRange } from "@/providers/global-range-provider"
import { debugGlow } from "@/lib/utils"
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

// ── Types ────────────────────────────────────────────────────────────────────

// One day of real fee data, sourced from /v1/series/total-fees + /v1/series/intent-volume.
// protocolUsd + intentsUsd = daily total fees in USD (real split by fee type).
// volumeUsd is joined by date from the intent-volume series (tooltip only).
export interface CumulativeFeesPoint {
  isoDate: string
  label: string
  protocolUsd: number
  intentsUsd: number
  cumulativeUsd: number
  volumeUsd: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PROTOCOL_COLOR = "#2e5c47"
const INTENTS_COLOR  = "#c2721f"
const LINE_COLOR     = "#00ec97"

type Range = GlobalRange | "ALL"

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAxisUSD(v: number): string {
  if (v === 0) return "$0"
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

function fmtTooltipUSD(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

// Round a max value up to a "nice" round number for axis domains.
function niceCeil(v: number): number {
  if (v <= 0) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const niceNorm = norm <= 1 ? 1 : norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 3 ? 3 : norm <= 3.5 ? 3.5 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10
  return niceNorm * mag
}

// Build an array of `count` evenly spaced ticks from 0..max.
function makeTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const raw = Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i))
  return [...new Set(raw)]
}

// Build ticks for a non-zero range (e.g. $33M–$35M) for zoomed-in views.
function makeRangeTicks(min: number, max: number, count = 4): number[] {
  if (min >= max) return [min]
  const step = (max - min) / count
  const raw = Array.from({ length: count + 1 }, (_, i) => Math.round(min + step * i))
  return [...new Set(raw)]
}

// Days back per range button (YTD handled separately).
const RANGE_DAYS: Record<Exclude<Range, "YTD" | "ALL">, number> = { "7D": 7, "30D": 30, "90D": 90 }
const YTD_START = `${new Date().getFullYear()}-01-01`

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as CumulativeFeesPoint | undefined
  if (!row) return null
  const daily = row.protocolUsd + row.intentsUsd
  return (
    <div className="rounded-lg border border-white/10 px-3 py-2 text-xs" style={{ background: "#1a1c1c" }}>
      <p className="text-gray-400 mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: PROTOCOL_COLOR }} />
          <span className="text-gray-400">Protocol Burn</span>
          <span className="ml-auto text-white font-medium">{fmtTooltipUSD(row.protocolUsd)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: INTENTS_COLOR }} />
          <span className="text-gray-400">Gross Revenue</span>
          <span className="ml-auto text-white font-medium">{fmtTooltipUSD(row.intentsUsd)}</span>
        </div>
        <div className="border-t border-white/10 pt-1 flex items-center gap-2">
          <span className="w-2 h-0.5 shrink-0" style={{ background: LINE_COLOR }} />
          <span className="text-gray-400">Daily total</span>
          <span className="ml-auto text-white font-semibold">{fmtTooltipUSD(daily)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-[10px]">Cumulative</span>
          <span className="ml-auto text-gray-300">{fmtTooltipUSD(row.cumulativeUsd)}</span>
        </div>
        {row.volumeUsd > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[10px]">Volume</span>
            <span className="ml-auto text-gray-300">{fmtTooltipUSD(row.volumeUsd)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── X-axis tick density per range ──────────────────────────────────────────────

function pickXTicks(data: CumulativeFeesPoint[], range: Range): string[] {
  if (range === "7D") return data.map(d => d.label)                              // every day
  if (range === "30D" || range === "90D") return data.filter((_, i) => i % 7 === 0).map(d => d.label) // weekly
  // ALL: first day of each month
  const seen = new Set<string>()
  return data.filter(d => {
    const month = d.isoDate.slice(0, 7)
    if (seen.has(month)) return false
    seen.add(month)
    return true
  }).map(d => d.label)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CumulativeFeesSection({ data }: { data: CumulativeFeesPoint[] }) {
  const { range: globalRange } = useGlobalRange()
  const [showAll, setShowAll] = useState(false)
  const range = showAll ? "ALL" : globalRange

  useEffect(() => { setShowAll(false) }, [globalRange])

  const view = useMemo(() => {
    if (data.length === 0) return data
    let filtered: CumulativeFeesPoint[]
    if (range === "ALL") {
      filtered = data
    } else if (range === "YTD") {
      filtered = data.filter(d => d.isoDate >= YTD_START)
    } else {
      const lastIso = data[data.length - 1].isoDate
      const cutoff = new Date(lastIso)
      cutoff.setDate(cutoff.getDate() - (RANGE_DAYS[range] - 1))
      const cutoffIso = cutoff.toISOString().slice(0, 10)
      filtered = data.filter(d => d.isoDate >= cutoffIso)
    }
    if (filtered.length === 0) return filtered
    // ALL shows true cumulative from inception — no rebase needed
    if (range === "ALL") return filtered
    // Rebase: subtract the cumulative total *before* the window starts
    // so Day 1 = Day 1's fees, Day 2 = Day1+Day2, etc.
    const first = filtered[0]
    const offset = first.cumulativeUsd - (first.protocolUsd + first.intentsUsd)
    return filtered.map(d => ({ ...d, cumulativeUsd: d.cumulativeUsd - offset }))
  }, [data, range])

  const xTicks = useMemo(() => pickXTicks(view, range), [view, range])

  // Dynamic axis — for 7D/30D use non-zero start so the cumulative movement is visible.
  const { leftTicks, leftDomain, rightMax, rightTicks } = useMemo(() => {
    const maxCum  = Math.max(0, ...view.map(d => d.cumulativeUsd))
    const minCum  = view.length > 0 ? Math.min(...view.map(d => d.cumulativeUsd)) : 0
    const maxDaily = Math.max(0, ...view.map(d => d.protocolUsd + d.intentsUsd))
    const rMax    = niceCeil(maxDaily)

    let lTicks: number[]
    let lDomain: [number, number]

    // Windowed cumulative always starts near 0 — use zero-based axis
    const lMax = niceCeil(maxCum)
    lTicks  = makeTicks(lMax)
    lDomain = [0, lMax]

    return { leftTicks: lTicks, leftDomain: lDomain, rightMax: rMax, rightTicks: makeTicks(rMax) }
  }, [view, range])

  // Use the last point's server-computed cumulative so the header matches the
  // green line endpoint exactly (summing daily values misses 0-fee filtered days).
  const headerTotal = useMemo(() => {
    if (view.length === 0) return 0
    return view[view.length - 1].cumulativeUsd
  }, [view])

  return (
    <div
      className="rounded-2xl border border-near-border bg-near-card overflow-hidden"
      style={debugGlow(data.length > 0 ? "api" : "static")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <h2 className="text-base font-semibold text-near-text mb-1">NEAR Cumulative Revenue</h2>
          <p className="text-xs text-near-muted max-w-xl">Protocol burn and gross revenue, compounding over time, in USD</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAll(v => !v)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={showAll
              ? { background: "#00ec97", color: "#0e0f0f" }
              : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
            }
          >
            View Full History
          </button>
          <p className="text-3xl font-bold text-white tracking-tight">{fmtTooltipUSD(headerTotal)}</p>
        </div>

      </div>

      {/* Chart — key forces remount on range change to reset Recharts animation */}
      <div className="px-2 pb-4">
        <ResponsiveContainer key={`cumfees-${range}`} width="100%" height={320}>
          <ComposedChart data={view} margin={{ top: 8, right: 12, left: 10, bottom: 0 }} barCategoryGap="20%">

            <XAxis
              dataKey="label"
              ticks={xTicks}
              tickFormatter={(label: string) => (range === "YTD" || range === "ALL") ? label.split(" ")[0] : label}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Left axis — cumulative. key prop scopes children to a separate
                React subtree, preventing Recharts tick key collisions with right. */}
            <YAxis
              key="cum-left"
              yAxisId="left"
              orientation="left"
              ticks={leftTicks}
              tickFormatter={fmtAxisUSD}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
              domain={leftDomain}
            />

            <YAxis key="cum-right" yAxisId="right" orientation="right" hide width={0} domain={[0, rightMax]} />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />

            {/* Stacked daily bars on right axis — real fee-type split */}
            <Bar
              yAxisId="right"
              dataKey="protocolUsd"
              stackId="daily"
              fill={PROTOCOL_COLOR}
              radius={[0, 0, 0, 0]}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Bar
              yAxisId="right"
              dataKey="intentsUsd"
              stackId="daily"
              fill={INTENTS_COLOR}
              radius={[2, 2, 0, 0]}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />

            {/* Cumulative line on left axis */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulativeUsd"
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

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 pb-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: PROTOCOL_COLOR }} />
          <span className="text-xs text-gray-500">Protocol Burn <span className="text-gray-600">(daily total)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: INTENTS_COLOR }} />
          <span className="text-xs text-gray-500">Gross Revenue <span className="text-gray-600">(daily total)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 shrink-0" style={{ background: LINE_COLOR }} />
          <span className="text-xs text-gray-500">Cumulative total</span>
        </div>
      </div>
    </div>
  )
}
