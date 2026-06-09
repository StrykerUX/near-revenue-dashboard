"use client"

import { useState, useMemo } from "react"
import { useGlobalRange } from "@/providers/global-range-provider"
import { Card } from "@/components/ui/card"
import { RevenueBarChart } from "@/components/charts/bar-chart"
import { EmissionsLineChart, AbsoluteEmissionsChart } from "@/components/charts/line-chart"
import { debugGlow } from "@/lib/utils"
import type { AbsoluteRevEmissionsPoint } from "@/lib/utils"
import type { TimeSeriesPoint } from "@/lib/types"

interface RevenueChartsProps {
  revenueSeries: TimeSeriesPoint[]
  emissionsMonthly: TimeSeriesPoint[]
  emissionsDaily: TimeSeriesPoint[]
  absoluteRevEmissions: AbsoluteRevEmissionsPoint[]
}

export function RevenueCharts({
  revenueSeries,
  emissionsMonthly,
  emissionsDaily,
  absoluteRevEmissions,
}: RevenueChartsProps) {
  const [view, setView] = useState<"pct" | "absolute">("pct")
  const { range } = useGlobalRange()

  // Monthly data: 7D/30D → last 1 month, 90D → last 3 months, YTD → current year months
  const ytdMonths = new Date().getMonth() + 1
  const nMonths = range === "YTD" ? ytdMonths : range === "90D" ? 3 : 1
  const visiblePct = useMemo(
    () => emissionsMonthly.slice(-nMonths),
    [emissionsMonthly, nMonths]
  )
  // absoluteRevEmissions is daily — filter by date range, not slice
  const visibleAbs = useMemo(() => {
    if (!absoluteRevEmissions.length) return absoluteRevEmissions
    if (range === "YTD") return absoluteRevEmissions
    const nDays = range === "90D" ? 90 : range === "30D" ? 30 : 7
    const last = absoluteRevEmissions[absoluteRevEmissions.length - 1].date
    const cutoff = new Date(last + "T12:00:00Z")
    cutoff.setDate(cutoff.getDate() - (nDays - 1))
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    return absoluteRevEmissions.filter(d => d.date >= cutoffIso)
  }, [absoluteRevEmissions, range])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Revenue */}
      <Card padding="none" className="overflow-hidden" style={debugGlow("api")}>
        <div className="p-6 pb-2">
          <h2 className="text-base font-semibold text-near-text mb-1">Monthly Revenue</h2>
          <p className="text-xs text-near-muted">Monthly revenue after partner payouts.</p>
        </div>
        <div className="px-2 pb-4">
          <RevenueBarChart data={revenueSeries} />
        </div>
      </Card>

      {/* Revenue vs Emissions */}
      <Card padding="none" className="overflow-hidden" style={debugGlow("api")}>
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Revenue vs Emissions</h2>
            <p className="text-xs text-near-muted">
              Comparison of protocol revenue relative to token issuance.
            </p>
          </div>
          {/* Toggle */}
          <div className="flex gap-1 shrink-0">
            {(["pct", "absolute"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                style={v === view
                  ? { background: "#ffffff", color: "#0e0f0f" }
                  : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
                }
              >
                {v === "pct" ? "% of Emissions" : "Absolute"}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 pb-2 flex items-center gap-4 flex-wrap">
          {view === "pct" ? (
            <div className="flex items-center gap-2 text-xs text-near-muted">
              <span className="inline-block w-4 h-px bg-near-green" />
              Revenue as % of $NEAR emissions
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs text-near-muted">
                <span className="w-3 h-0.5 shrink-0 bg-near-green" />
                Cumulative Revenue
              </div>
              <div className="flex items-center gap-1.5 text-xs text-near-muted">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: "#c2721f", opacity: 0.7 }} />
                Cumulative Emissions
              </div>
            </>
          )}
        </div>

        <div className="px-2 pb-4">
          {view === "pct" ? (
            <EmissionsLineChart data={visiblePct} mode="monthly" />
          ) : (
            <AbsoluteEmissionsChart data={visibleAbs} />
          )}
        </div>
      </Card>
    </div>
  )
}
