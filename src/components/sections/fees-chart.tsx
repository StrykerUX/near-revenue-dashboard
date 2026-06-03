import { Card } from "@/components/ui/card"
import { FeesAreaChart } from "@/components/charts/area-chart"
import { TOTAL_FEES_SERIES } from "@/lib/data"

export function FeesChart() {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-near-text">Total fees generated</h2>
          <span className="text-near-muted text-sm">(NEAR)</span>
        </div>
        <p className="text-xs text-near-muted">
          Cumulative gross fees across NEAR Protocol and NEAR Intents over the trailing year.
        </p>
      </div>
      <div className="px-2 pb-4">
        <FeesAreaChart data={TOTAL_FEES_SERIES} />
      </div>
    </Card>
  )
}
