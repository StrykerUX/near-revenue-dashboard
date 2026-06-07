"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RevenueBarChart } from "@/components/charts/bar-chart"
import { EmissionsLineChart } from "@/components/charts/line-chart"
import { debugGlow } from "@/lib/utils"
import type { TimeSeriesPoint } from "@/lib/types"

interface RevenueChartsProps {
  revenueSeries: TimeSeriesPoint[]
  emissionsMonthly: TimeSeriesPoint[]
  emissionsDaily: TimeSeriesPoint[]
}

export function RevenueCharts({ revenueSeries, emissionsMonthly, emissionsDaily }: RevenueChartsProps) {
  const [emissionsMode] = useState("Monthly")

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

      {/* Revenue vs emissions */}
      <Card padding="none" className="overflow-hidden" style={debugGlow("api")}>
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Revenue vs emissions</h2>
            <p className="text-xs text-near-muted">
              Comparison of protocol revenue relative to token issuance.
            </p>
          </div>
        </div>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 text-xs text-near-muted">
            <span className="inline-block w-4 h-px bg-near-green" />
            Revenue as % of $NEAR emissions
          </div>
        </div>
        <div className="px-2 pb-4">
          <EmissionsLineChart
            data={emissionsMode === "Monthly" ? emissionsMonthly : emissionsDaily}
            mode={emissionsMode === "Monthly" ? "monthly" : "daily"}
          />
        </div>
      </Card>
    </div>
  )
}
