"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { debugGlow } from "@/lib/utils"
import { Dropdown } from "@/components/ui/dropdown"
import { FeesAreaChart } from "@/components/charts/area-chart"
import type { TimeSeriesPoint } from "@/lib/types"

interface FeesChartProps {
  dataNear: TimeSeriesPoint[]
  dataUsd: TimeSeriesPoint[]
}

export function FeesChart({ dataNear, dataUsd }: FeesChartProps) {
  const [denomination, setDenomination] = useState<"NEAR" | "USD">("NEAR")

  return (
    <Card padding="none" className="overflow-hidden" style={debugGlow("api")}>
      <div className="p-6 pb-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-near-text mb-1">Total fees generated</h2>
          <p className="text-xs text-near-muted">
            Cumulative gross fees across NEAR Protocol and NEAR Intents over the trailing year.
          </p>
        </div>
        <Dropdown value={denomination} onChange={(v) => setDenomination(v as "NEAR" | "USD")} options={["NEAR", "USD"]} />
      </div>
      <div className="px-2 pb-4">
        <FeesAreaChart
          data={denomination === "NEAR" ? dataNear : dataUsd}
          denomination={denomination === "USD" ? "usd" : "near"}
        />
      </div>
    </Card>
  )
}
