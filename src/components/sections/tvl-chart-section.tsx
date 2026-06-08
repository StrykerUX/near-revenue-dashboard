"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, type TooltipProps,
} from "recharts"
import type { TimeSeriesPoint } from "@/lib/types"
import { debugGlow } from "@/lib/utils"

// ── Constants ──────────────────────────────────────────────────────────────────

const VIEWS = ["TVL Level", "Daily Change"] as const
type View = typeof VIEWS[number]

const RANGES = ["7D", "30D", "90D", "ALL"] as const
type Range = typeof RANGES[number]

const RANGE_DAYS: Record<Exclude<Range, "ALL">, number> = { "7D": 7, "30D": 30, "90D": 90 }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtTvl(v: number): string {
  if (v === 0) return "$0"
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function fmtFull(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : "+"
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}K`
  return `${v < 0 ? "-" : ""}$${abs.toFixed(0)}`
}

function buildTicks(max: number): number[] {
  if (max <= 0) return [0]
  const abs = Math.abs(max)
  const unit = abs > 4_000_000 ? 1_000_000 : abs > 400_000 ? 100_000 : 10_000
  const step = Math.ceil(abs * 1.15 / 4 / unit) * unit
  if (step === 0) return [0]
  return [...new Set([0, step, step * 2, step * 3, step * 4])]
}

function buildRangeTicks(min: number, max: number, count = 4): number[] {
  if (min >= max) return [min]
  const step = (max - min) / count
  const raw = Array.from({ length: count + 1 }, (_, i) => Math.round(min + step * i))
  return [...new Set(raw)]
}

function buildDeltaTicks(min: number, max: number): { ticks: number[]; domain: [number, number] } {
  const bound = Math.max(Math.abs(min), Math.abs(max)) * 1.2
  if (bound <= 0) return { ticks: [0], domain: [-1, 1] }
  const unit = bound > 1_000_000 ? 1_000_000 : bound > 100_000 ? 100_000 : 10_000
  const step = Math.ceil(bound / 3 / unit) * unit
  if (step === 0) return { ticks: [0], domain: [-1, 1] }
  const ticks = [...new Set([-step * 3, -step * 2, -step, 0, step, step * 2, step * 3])]
  return { ticks, domain: [-step * 3, step * 3] }
}

function getMonthlyTicks(data: { date: string }[]): string[] {
  const seen = new Set<string>()
  return data.filter(d => {
    const k = d.date.slice(0, 7)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  }).map(d => d.date)
}

function fmtMonthTick(s: string): string {
  const d = new Date(s + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short" })
}

function fmtDayTick(s: string): string {
  const d = new Date(s + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ── Tooltips ───────────────────────────────────────────────────────────────────

function LevelTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  const d = new Date((label as string) + "T12:00:00Z")
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-near-subtle text-xs mb-1">
        {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <span className="text-near-green font-semibold">{fmtTvl(val as number)}</span>
    </div>
  )
}

function DeltaTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value as number ?? 0
  const d = new Date((label as string) + "T12:00:00Z")
  const positive = val >= 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-near-subtle text-xs mb-1">
        {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <span className={`font-semibold ${positive ? "text-near-green" : "text-red-400"}`}>
        {positive ? "+" : ""}{fmtFull(val)}
      </span>
      <p className="text-near-subtle text-xs mt-0.5">net TVL change</p>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

interface TvlChartSectionProps {
  data: TimeSeriesPoint[]
  currentTvl: number
  growthX: string | null
}

export function TvlChartSection({ data, currentTvl, growthX }: TvlChartSectionProps) {
  const [view, setView]   = useState<View>("TVL Level")
  const [range, setRange] = useState<Range>("ALL")

  // ── Filter by range — anchored to the MOST RECENT date in the dataset ────────
  const filtered = useMemo(() => {
    if (range === "ALL" || data.length === 0) return data
    // Find max date explicitly (don't assume sort order)
    const lastIso = data.reduce((max, d) => d.date > max ? d.date : max, data[0].date)
    const cutoff  = new Date(lastIso + "T12:00:00Z")
    cutoff.setDate(cutoff.getDate() - (RANGE_DAYS[range] - 1))
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    return data.filter(d => d.date >= cutoffIso)
  }, [data, range])

  // ── Delta series ───────────────────────────────────────────────────────────
  const deltaData = useMemo(() =>
    filtered.slice(1).map((d, i) => ({
      date: d.date,
      delta: d.value - filtered[i].value,
    })),
  [filtered])

  // ── Axis config ────────────────────────────────────────────────────────────
  const xTicks = useMemo(() => {
    const src = view === "TVL Level" ? filtered : deltaData
    if (range === "7D")  return src.map(d => d.date)                             // every day
    if (range === "30D") return src.filter((_, i) => i % 7 === 0).map(d => d.date) // every week
    if (range === "90D") return src.filter((_, i) => i % 7 === 0).map(d => d.date) // every week
    return getMonthlyTicks(src)                                                    // ALL: monthly
  }, [filtered, deltaData, view, range])

  const fmtTick = (range === "7D" || range === "30D" || range === "90D") ? fmtDayTick : fmtMonthTick

  const { lvlTicks, lvlDomain } = useMemo(() => {
    const maxVal = Math.max(0, ...filtered.map(d => d.value))
    const minVal = filtered.length > 0 ? Math.min(...filtered.map(d => d.value)) : 0

    if (range === "ALL" || range === "90D") {
      const ticks = buildTicks(maxVal)
      return { lvlTicks: ticks, lvlDomain: [0, ticks[ticks.length - 1]] as [number, number] }
    } else {
      const pad  = Math.max((maxVal - minVal) * 0.15, maxVal * 0.005)
      const lMin = Math.max(0, minVal - pad)
      const lMax = maxVal + pad
      return { lvlTicks: buildRangeTicks(lMin, lMax), lvlDomain: [lMin, lMax] as [number, number] }
    }
  }, [filtered, range])

  const deltaMin  = useMemo(() => Math.min(0, ...deltaData.map(d => d.delta)), [deltaData])
  const deltaMax  = useMemo(() => Math.max(0, ...deltaData.map(d => d.delta)), [deltaData])
  const { ticks: deltaTicks, domain: deltaDomain } = useMemo(
    () => buildDeltaTicks(deltaMin, deltaMax),
    [deltaMin, deltaMax]
  )

  const fmtTvlVal = (v: number) => fmtTvl(v)

  return (
    <div
      className="rounded-2xl border border-near-border bg-near-card overflow-hidden"
      style={debugGlow("api")}
    >
      {/* Header */}
      <div className="p-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-base font-semibold text-near-text">Confidential Intents TVL</h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-near-border text-near-subtle font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-near-green/60 shrink-0" />
              Dune Analytics
            </span>
          </div>
          <p className="text-xs text-near-muted max-w-xl">
            {view === "TVL Level"
              ? "Total value locked in NEAR Intents' confidential pools, tracked daily in USD."
              : "Net daily change in TVL — positive bars are days assets flowed in, negative bars are net outflows."}
          </p>
        </div>

        {currentTvl > 0 && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-near-green">{fmtFull(currentTvl).replace("+", "")}</p>
            {growthX && <p className="text-xs text-near-green/60">{growthX}× since launch</p>}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="px-6 pb-4 flex items-center gap-6 flex-wrap">
        {/* View toggle */}
        <div className="flex gap-1">
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={v === view
                ? { background: "var(--near-green)", color: "#0e0f0f" }
                : { background: "transparent", color: "var(--near-subtle)", border: "1px solid var(--near-border)" }
              }
            >
              {v}
            </button>
          ))}
        </div>

        {/* Range toggle */}
        <div className="flex gap-1 ml-auto">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={r === range
                ? { background: "#ffffff", color: "#0e0f0f" }
                : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — key forces full remount on range/view change to avoid
          Recharts morphing animation from old dataset positions */}
      <div className="px-2 pb-4">
        {view === "TVL Level" ? (
          <ResponsiveContainer key={`tvl-level-${range}`} width="100%" height={280}>
            <BarChart data={filtered} margin={{ top: 8, right: 56, left: 10, bottom: 0 }} barCategoryGap="12%">
              <defs>
                <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
              <XAxis dataKey="date" ticks={xTicks} tickFormatter={fmtTick}
                tick={{ fill: "var(--near-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis key="tvl-left" ticks={lvlTicks} tickFormatter={fmtTvlVal}
                tick={{ fill: "var(--near-subtle)", fontSize: 11 }} axisLine={false} tickLine={false}
                width={56} domain={lvlDomain} />
              <YAxis key="tvl-right" yAxisId="right" orientation="right" hide domain={lvlDomain} />
              <Tooltip content={<LevelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" fill="url(#tvlGrad)" radius={[2, 2, 0, 0]}
                isAnimationActive animationDuration={800} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer key={`tvl-delta-${range}`} width="100%" height={280}>
            <BarChart data={deltaData} margin={{ top: 8, right: 56, left: 10, bottom: 0 }} barCategoryGap="12%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
              <XAxis dataKey="date" ticks={xTicks} tickFormatter={fmtTick}
                tick={{ fill: "var(--near-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis key="delta-left" ticks={deltaTicks} tickFormatter={fmtTvlVal}
                tick={{ fill: "var(--near-subtle)", fontSize: 11 }} axisLine={false} tickLine={false}
                width={56} domain={deltaDomain} />
              <YAxis key="delta-right" yAxisId="right" orientation="right" hide domain={deltaDomain} />
              <Tooltip content={<DeltaTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="delta" radius={[2, 2, 0, 0]}
                isAnimationActive animationDuration={800} animationEasing="ease-out">
                {deltaData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.delta >= 0 ? "var(--near-green)" : "#ef4444"}
                    fillOpacity={entry.delta >= 0 ? 0.75 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
