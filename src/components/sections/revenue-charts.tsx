"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Dropdown } from "@/components/ui/dropdown"
import { RevenueBarChart } from "@/components/charts/bar-chart"
import { EmissionsLineChart } from "@/components/charts/line-chart"
import { SwapBreakdownChart } from "@/components/charts/stacked-bar-chart"
import { EMISSIONS_SERIES, CONFIDENTIAL_TVL, SWAP_BREAKDOWN } from "@/lib/data"
import type { TimeSeriesPoint } from "@/lib/types"

export function RevenueCharts({ revenueSeries }: { revenueSeries: TimeSeriesPoint[] }) {
  const [tvlTimeframe, setTvlTimeframe] = useState("Monthly")
  const [swapTimeframe, setSwapTimeframe] = useState("Daily")
  const [revenueTimeframe, setRevenueTimeframe] = useState("Monthly")
  const [emissionsMode, setEmissionsMode] = useState("Absolute")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Confidential TVL */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Confidential TVL</h2>
            <p className="text-xs text-near-muted">NEAR Intents Confidential TVL in USD</p>
          </div>
          <Dropdown value={tvlTimeframe} onChange={setTvlTimeframe} options={["Monthly", "Weekly"]} />
        </div>
        <div className="px-2 pb-4">
          <RevenueBarChart data={CONFIDENTIAL_TVL} />
        </div>
      </Card>

      {/* NEAR Intent Swap Breakdown */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">NEAR Intent Swap Breakdown</h2>
            <p className="text-xs text-near-muted">Split b/t confidential &amp; non-confidential swaps</p>
          </div>
          <Dropdown value={swapTimeframe} onChange={setSwapTimeframe} options={["Daily", "Weekly", "Monthly"]} />
        </div>
        <div className="px-6 pb-2 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-near-muted">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#F08080" }} />
            Normal Swaps
          </div>
          <div className="flex items-center gap-2 text-xs text-near-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-near-green" />
            Confidential Swaps
          </div>
        </div>
        <div className="px-2 pb-4">
          <SwapBreakdownChart data={SWAP_BREAKDOWN} />
        </div>
      </Card>

      {/* Revenue over time */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-near-text mb-1">Revenue over time</h2>
            <p className="text-xs text-near-muted">Monthly revenue after partner payouts.</p>
          </div>
          <Dropdown value={revenueTimeframe} onChange={setRevenueTimeframe} options={["Monthly", "Weekly"]} />
        </div>
        <div className="px-2 pb-4">
          <RevenueBarChart data={revenueSeries} />
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
          <Dropdown value={emissionsMode} onChange={setEmissionsMode} options={["Absolute", "Percent"]} />
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
