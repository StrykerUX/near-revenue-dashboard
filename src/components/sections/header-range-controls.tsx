"use client"

import { useGlobalRange, type GlobalRange } from "@/providers/global-range-provider"

const RANGES: GlobalRange[] = ["7D", "30D", "90D", "YTD", "ALL"]
const RANGE_LABELS: Record<GlobalRange, string> = {
  "7D": "7D", "30D": "30D", "90D": "90D", "YTD": "YTD", "ALL": "All time",
}

export function HeaderRangeControls() {
  const { range, setRange } = useGlobalRange()
  return (
    <div className="flex items-center gap-1">
      {RANGES.map(r => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className="px-3 py-1 rounded text-xs font-medium transition-colors"
          style={
            r === range
              ? { background: "#00ec97", color: "#0e0f0f" }
              : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
          }
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  )
}
