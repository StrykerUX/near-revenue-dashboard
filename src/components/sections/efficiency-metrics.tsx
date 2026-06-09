"use client"

import { useMemo } from "react"
import { useGlobalRange } from "@/providers/global-range-provider"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
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

// ── Shared tooltip ─────────────────────────────────────────────────────────────

function MiniTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const val = payload[0].value ?? 0
  return (
    <div className="bg-near-card border border-near-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-near-subtle text-xs mb-1">{label}</p>
      <span className="text-near-green font-semibold">{fmtPct(val as number)}</span>
    </div>
  )
}

// ── Shared line chart ──────────────────────────────────────────────────────────

function MetricLine({ data, chartKey, xTicks, tickFmt }: {
  data: ChartPoint[]
  chartKey: string
  xTicks?: string[]
  tickFmt?: (s: string) => string
}) {
  const max   = Math.max(0, ...data.map(d => d.value))
  const ticks = buildTicks(max * 1.15)
  const domain: [number, number] = [0, ticks[ticks.length - 1]]

  return (
    <ResponsiveContainer key={chartKey} width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          tickFormatter={fmtPct}
          tick={{ fill: "var(--near-subtle)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={domain}
        />
        <Tooltip content={<MiniTooltip />} cursor={{ stroke: "var(--near-border)" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--near-green)"
          strokeWidth={1.5}
          dot={{ r: 3, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 1.5 }}
          activeDot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
      </LineChart>
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

  // Monthly chart: 7D/30D → 1 month, 90D → 3 months, ALL → all
  const visible = range === "ALL" ? allPoints : allPoints.slice(-(range === "90D" ? 3 : 1))

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4">
      <p className="text-xs font-medium text-near-muted uppercase tracking-wider mb-0.5">
        Net Revenue Yield
      </p>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Net revenue as % of swap volume — how much of each dollar traded becomes net protocol revenue.
      </p>
      <MetricLine data={visible} chartKey={`net-rev-${range}`} />
    </div>
  )
}

// ── Chart 2: Gross Fee Rate (daily available → 7D/30D/90D/ALL) ────────────────

function GrossFeeRateChart({ totalFeesSeries, intentVolumeSeries }: {
  totalFeesSeries: TotalFeesSeriesPoint[]
  intentVolumeSeries: IntentVolumePoint[]
}) {
  const { range } = useGlobalRange()

  // Build daily join
  const dailyPoints = useMemo((): { date: string; value: number }[] => {
    const volMap: Record<string, number> = {}
    for (const p of intentVolumeSeries) {
      volMap[p.date_at] = p.volume_usd
    }
    return totalFeesSeries
      .filter(p => p.fees_usd > 0)
      .map(p => {
        const vol = volMap[p.date_at] ?? 0
        return { date: p.date_at, value: vol > 0 ? (p.fees_usd / vol) * 100 : 0 }
      })
      .filter(p => p.value > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [totalFeesSeries, intentVolumeSeries])

  const { points, xTicks, tickFmt } = useMemo(() => {
    if (range === "ALL") {
      // Aggregate to monthly
      const byMonth: Record<string, { fees: number; vol: number }> = {}
      for (const p of totalFeesSeries.filter(t => t.fees_usd > 0)) {
        const k = p.date_at.slice(0, 7)
        if (!byMonth[k]) byMonth[k] = { fees: 0, vol: 0 }
        byMonth[k].fees += p.fees_usd
      }
      for (const p of intentVolumeSeries) {
        const k = p.date_at.slice(0, 7)
        if (byMonth[k]) byMonth[k].vol += p.volume_usd
      }
      const pts: ChartPoint[] = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ label: fmtMonthLabel(k + "-01"), value: v.vol > 0 ? (v.fees / v.vol) * 100 : 0 }))
        .filter(p => p.value > 0)
      return { points: pts, xTicks: undefined, tickFmt: undefined }
    }

    const nDays = range === "7D" ? 7 : range === "30D" ? 30 : 90
    const lastDate = maxIsoDate(dailyPoints.map(p => p.date))
    const cutoff = new Date(lastDate + "T12:00:00Z")
    cutoff.setDate(cutoff.getDate() - (nDays - 1))
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    const filtered = dailyPoints.filter(p => p.date >= cutoffIso)
    const pts: ChartPoint[] = filtered.map(p => ({ label: fmtDayLabel(p.date), value: p.value }))

    const step = range === "7D" ? 1 : range === "30D" ? 7 : 14
    const ticks = pts.filter((_, i) => i % step === 0).map(p => p.label)
    return { points: pts, xTicks: ticks, tickFmt: undefined }
  }, [range, dailyPoints, totalFeesSeries, intentVolumeSeries])

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4">
      <p className="text-xs font-medium text-near-muted uppercase tracking-wider mb-0.5">
        Gross Fee Rate
      </p>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Gross fees as % of swap volume — the effective fee rate across all swaps routed through NEAR Intents.
      </p>
      <MetricLine data={points} chartKey={`gross-fee-${range}`} xTicks={xTicks} tickFmt={tickFmt} />
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

  // Monthly chart: 7D/30D → 1 month, 90D → 3 months, ALL → all
  const visible = range === "ALL" ? allPoints : allPoints.slice(-(range === "90D" ? 3 : 1))

  return (
    <div className="rounded-2xl border border-near-border bg-near-card p-4">
      <p className="text-xs font-medium text-near-muted uppercase tracking-wider mb-0.5">
        Capture Rate Trend
      </p>
      <p className="text-xs text-near-subtle mb-2 leading-relaxed">
        Net revenue as % of gross fees — how much of the fees generated the protocol retains, month by month.
      </p>
      {/* Full-width: taller chart to take advantage of the extra space */}
      <ResponsiveContainer key={`capture-${range}`} width="100%" height={200}>
        <LineChart data={visible} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--near-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            ticks={buildTicks(Math.max(0, ...visible.map(d => d.value)) * 1.15)}
            tickFormatter={fmtPct}
            tick={{ fill: "var(--near-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, buildTicks(Math.max(0, ...visible.map(d => d.value)) * 1.15).at(-1) ?? 1]}
          />
          <Tooltip content={<MiniTooltip />} cursor={{ stroke: "var(--near-border)" }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--near-green)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "var(--near-green)", stroke: "var(--near-card)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
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
          Three key ratios showing how efficiently NEAR Intents converts swap volume into revenue.
          Net Revenue Yield and Capture Rate are monthly-grained; Gross Fee Rate supports daily resolution.
        </p>
      </div>

      {/* Top row: Gross Fee Rate + Net Revenue Yield */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <GrossFeeRateChart
          totalFeesSeries={totalFeesSeries}
          intentVolumeSeries={intentVolumeSeries}
        />
        <NetRevYieldChart
          revenueSeries={revenueSeries}
          intentVolumeSeries={intentVolumeSeries}
        />
      </div>

      {/* Bottom full-width: Capture Rate Trend */}
      <CaptureRateTrendChart
        revenueSeries={revenueSeries}
        totalFeesSeries={totalFeesSeries}
      />
    </div>
  )
}
