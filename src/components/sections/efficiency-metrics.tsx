"use client"

import { useMemo } from "react"
import { useGlobalRange } from "@/providers/global-range-provider"
import {
  ComposedChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, type TooltipProps,
} from "recharts"
import type { RevenueSeriesPoint, IntentVolumePoint, TotalFeesSeriesPoint } from "@/lib/api"
import { debugGlow } from "@/lib/utils"

// ── Shared types ───────────────────────────────────────────────────────────────

interface ChartPoint { label: string; value: number }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtPct(v: number): string {
  if (v >= 10) return `${v.toFixed(1)}%`
  if (v >= 1)  return `${v.toFixed(2)}%`
  return `${v.toFixed(3)}%`
}

function fmtPctTick(v: number): string {
  return `${Math.round(v)}%`
}

function fmtBps(v: number): string {
  const bps = v * 100
  if (bps >= 10) return `${bps.toFixed(1)} bps`
  return `${bps.toFixed(2)} bps`
}

function fmtBpsTick(v: number): string {
  return `${Math.round(v * 100)}`
}

function buildTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const step = max / count
  const raw = Array.from({ length: count + 1 }, (_, i) =>
    parseFloat((step * i).toFixed(5))
  )
  return [...new Set(raw)]
}

function fmtMonthLabel(s: string): string {
  // Accept "YYYY-MM" (7 chars) or "YYYY-MM-DD" (10 chars)
  const iso = s.length <= 7 ? s + "-01" : s.slice(0, 10)
  const d = new Date(iso + "T12:00:00Z")
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function fmtDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function maxIsoDate(dates: string[]): string {
  return dates.reduce((m, d) => d > m ? d : m, dates[0] ?? "")
}

// ── Shared line chart ──────────────────────────────────────────────────────────

function MetricLine({ data, chartKey, xTicks, tickFmt, valueFmt = fmtPct, yAxisTickFmt }: {
  data: ChartPoint[]
  chartKey: string
  xTicks?: string[]
  tickFmt?: (s: string) => string
  valueFmt?: (v: number) => string
  yAxisTickFmt?: (v: number) => string
}) {
  const max   = Math.max(0, ...data.map(d => d.value))
  const ticks = buildTicks(max * 1.15)
  const domain: [number, number] = [0, ticks[ticks.length - 1]]

  function TooltipContent({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null
    const val = payload[0].value ?? 0
    return (
      <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-near-subtle text-xs mb-1">{label}</p>
        <span className="text-near-green font-semibold">{valueFmt(val as number)}</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer key={chartKey} width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
        <defs>
          <linearGradient id={`metricGrad-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
        <XAxis
          dataKey="label"
          ticks={xTicks}
          tickFormatter={tickFmt}
          tick={{ fill: "var(--near-subtle)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={ticks}
          tickFormatter={yAxisTickFmt ?? valueFmt}
          tick={{ fill: "var(--near-subtle)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={28}
          domain={domain}
        />
        <Tooltip content={<TooltipContent />} cursor={{ stroke: "var(--near-border)" }} />
        <Area
          type="monotone"
          dataKey="value"
          fill={`url(#metricGrad-${chartKey})`}
          stroke="var(--near-green)"
          strokeWidth={1.5}
          dot={{ r: 3, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 1.5 }}
          activeDot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ── Chart 1: Net Revenue Yield (monthly only — revenue is monthly-grained) ────

function NetRevYieldChart({ revenueSeries, intentVolumeSeries }: {
  revenueSeries: RevenueSeriesPoint[]
  intentVolumeSeries: IntentVolumePoint[]
}) {
  const { range } = useGlobalRange()

  const allPoints = useMemo((): ChartPoint[] => {
    const volByMonth: Record<string, number> = {}
    for (const p of intentVolumeSeries) {
      const k = p.date_at.slice(0, 7)
      volByMonth[k] = (volByMonth[k] ?? 0) + p.volume_usd
    }
    return revenueSeries
      .filter(p => p.revenue_usd > 0)
      .map(p => {
        const k   = p.period_month.slice(0, 7)
        const vol = volByMonth[k] ?? 0
        return {
          label: fmtMonthLabel(p.period_month),
          value: vol > 0 ? (p.revenue_usd / vol) * 100 : 0,
        }
      })
      .filter(p => p.value > 0)
  }, [revenueSeries, intentVolumeSeries])

  const ytdMonths = new Date().getMonth() + 1
  const dimmed = range === "7D" || range === "30D"
  const visible = range === "YTD" ? allPoints.slice(-ytdMonths) : allPoints.slice(-3)

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4 flex flex-col">
      <div className="flex items-baseline gap-2 mb-0.5">
        <p className="text-xs font-medium text-near-muted uppercase tracking-wider">Net Revenue Yield</p>
        <span className="text-xs text-near-subtle">(bps)</span>
        {dimmed && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-near-subtle border border-near-border">Showing 90D</span>}
      </div>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Net revenue as % of swap volume — protocol revenue retained after partner and frontend fee splits.
      </p>
      <div className="mt-auto transition-opacity duration-300" style={{ opacity: dimmed ? 0.55 : 1 }}>
        <MetricLine data={visible} chartKey={`net-rev-${range}`} valueFmt={fmtBps} yAxisTickFmt={fmtBpsTick} />
      </div>
    </div>
  )
}

// ── Chart 2: Gross Fee Rate (daily available → 7D/30D/90D/ALL) ────────────────

function GrossFeeRateChart({ totalFeesSeries, intentVolumeSeries }: {
  totalFeesSeries: TotalFeesSeriesPoint[]
  intentVolumeSeries: IntentVolumePoint[]
}) {
  const { range } = useGlobalRange()

  // Always aggregate to monthly — consistent with Net Revenue Yield and Capture Rate Trend
  const allPoints = useMemo((): ChartPoint[] => {
    const volByMonth: Record<string, number> = {}
    for (const p of intentVolumeSeries) {
      const k = p.date_at.slice(0, 7)
      volByMonth[k] = (volByMonth[k] ?? 0) + p.volume_usd
    }
    const feesByMonth: Record<string, number> = {}
    for (const p of totalFeesSeries) {
      if (p.fees_usd > 0) {
        const k = p.date_at.slice(0, 7)
        feesByMonth[k] = (feesByMonth[k] ?? 0) + p.fees_usd
      }
    }
    return Object.keys(feesByMonth)
      .sort()
      .map(k => {
        const vol = volByMonth[k] ?? 0
        return { label: fmtMonthLabel(k + "-01"), value: vol > 0 ? (feesByMonth[k] / vol) * 100 : 0 }
      })
      .filter(p => p.value > 0)
  }, [totalFeesSeries, intentVolumeSeries])

  const ytdMonths = new Date().getMonth() + 1
  const dimmed = range === "7D" || range === "30D"
  const points = range === "YTD" ? allPoints.slice(-ytdMonths) : allPoints.slice(-3)

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4 flex flex-col">
      <div className="flex items-baseline gap-2 mb-0.5">
        <p className="text-xs font-medium text-near-muted uppercase tracking-wider">Gross Fee Rate</p>
        <span className="text-xs text-near-subtle">(bps)</span>
        {dimmed && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-near-subtle border border-near-border">Showing 90D</span>}
      </div>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Gross fees as % of swap volume — the effective fee rate across all swaps routed through NEAR Intents.
      </p>
      <div className="mt-auto transition-opacity duration-300" style={{ opacity: dimmed ? 0.55 : 1 }}>
        <MetricLine data={points} chartKey={`gross-fee-${range}`} valueFmt={fmtBps} yAxisTickFmt={fmtBpsTick} />
      </div>
    </div>
  )
}

// ── Chart 3: Capture Rate Trend (monthly only) ────────────────────────────────

function CaptureRateTrendChart({ revenueSeries, totalFeesSeries }: {
  revenueSeries: RevenueSeriesPoint[]
  totalFeesSeries: TotalFeesSeriesPoint[]
}) {
  const { range } = useGlobalRange()

  const allPoints = useMemo((): ChartPoint[] => {
    const feesByMonth: Record<string, number> = {}
    for (const p of totalFeesSeries) {
      if (p.fees_usd > 0) {
        const k = p.date_at.slice(0, 7)
        feesByMonth[k] = (feesByMonth[k] ?? 0) + p.fees_usd
      }
    }
    return revenueSeries
      .filter(p => p.revenue_usd > 0)
      .map(p => {
        const k    = p.period_month.slice(0, 7)
        const fees = feesByMonth[k] ?? 0
        return {
          label: fmtMonthLabel(p.period_month),
          value: fees > 0 ? (p.revenue_usd / fees) * 100 : 0,
        }
      })
      .filter(p => p.value > 0)
  }, [revenueSeries, totalFeesSeries])

  const ytdMonths = new Date().getMonth() + 1
  const dimmed = range === "7D" || range === "30D"
  const visible = range === "YTD" ? allPoints.slice(-ytdMonths) : allPoints.slice(-3)

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4 flex flex-col">
      <div className="flex items-baseline gap-2 mb-0.5">
        <p className="text-xs font-medium text-near-muted uppercase tracking-wider">Capture Rate Trend</p>
        {dimmed && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-near-subtle border border-near-border">Showing 90D</span>}
      </div>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Net revenue as % of gross fees — the protocol&apos;s share of gross fees, and whether that share is growing, month by month.
      </p>
      {/* Full-width: taller chart to take advantage of the extra space */}
      <div className="mt-auto transition-opacity duration-300" style={{ opacity: dimmed ? 0.55 : 1 }}>
      <ResponsiveContainer key={`capture-${range}`} width="100%" height={200}>
        <ComposedChart data={visible} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="captureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--near-green)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--near-green)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            ticks={buildTicks(Math.max(0, ...visible.map(d => d.value)) * 1.15)}
            tickFormatter={fmtPctTick}
            tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, buildTicks(Math.max(0, ...visible.map(d => d.value)) * 1.15).at(-1) ?? 1]}
          />
          <Tooltip
            content={({ active, payload, label }: import("recharts").TooltipProps<number, string>) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
                  <p className="text-near-subtle text-xs mb-1">{label}</p>
                  <span className="text-near-green font-semibold">{fmtPct(payload[0].value as number ?? 0)}</span>
                </div>
              )
            }}
            cursor={{ stroke: "var(--near-border)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            fill="url(#captureGrad)"
            stroke="var(--near-green)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────────────────────

interface EfficiencyMetricsProps {
  revenueSeries: RevenueSeriesPoint[]
  intentVolumeSeries: IntentVolumePoint[]
  totalFeesSeries: TotalFeesSeriesPoint[]
}

export function EfficiencyMetrics({
  revenueSeries,
  intentVolumeSeries,
  totalFeesSeries,
}: EfficiencyMetricsProps) {
  const hasData = revenueSeries.some(p => p.revenue_usd > 0)
  if (!hasData) return null

  return (
    <div style={debugGlow("api")}>
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-base font-semibold text-near-text">Protocol Efficiency</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-near-border text-near-subtle font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-near-green/60 shrink-0" />
            Onchain
          </span>
        </div>
        <p className="text-xs text-near-muted max-w-2xl leading-relaxed">
          Three ratios tracking NEAR&apos;s path to deflation. As Intents volume scales, these measure whether the protocol is capturing enough revenue to become a net sink for NEAR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GrossFeeRateChart
          totalFeesSeries={totalFeesSeries}
          intentVolumeSeries={intentVolumeSeries}
        />
        <NetRevYieldChart
          revenueSeries={revenueSeries}
          intentVolumeSeries={intentVolumeSeries}
        />
        <CaptureRateTrendChart
          revenueSeries={revenueSeries}
          totalFeesSeries={totalFeesSeries}
        />
      </div>
    </div>
  )
}
