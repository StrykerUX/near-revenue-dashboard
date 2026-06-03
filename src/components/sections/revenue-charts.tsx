"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Dropdown } from "@/components/ui/dropdown"
import { RevenueBarChart } from "@/components/charts/bar-chart"
import { EmissionsLineChart } from "@/components/charts/line-chart"
import { REVENUE_MONTHLY, EMISSIONS_SERIES } from "@/lib/data"

export function RevenueCharts() {
  const [timeframe, setTimeframe] = useState("Monthly")
  const [mode, setMode] = useState("Absolute")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue over time */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Revenue over time</h2>
            <p className="text-xs text-near-muted">Monthly revenue after partner payouts.</p>
          </div>
          <Dropdown value={timeframe} onChange={setTimeframe} options={["Monthly", "Weekly"]} />
        </div>
        <div className="px-2 pb-4">
          <RevenueBarChart data={REVENUE_MONTHLY} />
        </div>
      </Card>

      {/* Revenue vs emissions */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Revenue vs emissions</h2>
            <p className="text-xs text-near-muted">
              Comparison of protocol revenue relative to token issuance.
            </p>
          </div>
          <Dropdown value={mode} onChange={setMode} options={["Absolute", "Percent"]} />
        </div>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 text-xs text-near-muted">
            <span className="inline-block w-4 h-px bg-near-green" />
            Revenue as % of $NEAR emissions
          </div>
        </div>
        <div className="px-2 pb-4">
          <EmissionsLineChart data={EMISSIONS_SERIES} />
        </div>
      </Card>
    </div>
  )
}
