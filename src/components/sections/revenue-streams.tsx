"use client"

import { useState } from "react"
import type { RevenueStreamItem } from "@/lib/api"

type Timeframe = "d30" | "d7" | "ytd" | "all_time"

const STREAM_COLORS: Record<string, string> = {
  "Front-end": "#00ec97",
  "Quote Improvement": "#06b6d4",
  "Authorized partner": "#8b5cf6",
  "Private agreement": "#f59e0b",
  "Unauthorized partner": "#f87171",
  "Other": "#94a3b8",
}

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  d7: "7D",
  d30: "30D",
  ytd: "YTD",
  all_time: "All time",
}

function getRevenue(item: RevenueStreamItem, tf: Timeframe): number {
  if (tf === "d7") return item.revenue_usd_d7
  if (tf === "d30") return item.revenue_usd_d30
  if (tf === "ytd") return item.revenue_usd_ytd
  return item.revenue_usd_all_time
}

function formatUSD(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

export function RevenueStreams({ streams }: { streams: RevenueStreamItem[] }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("d30")

  const sorted = [...streams]
    .sort((a, b) => getRevenue(b, timeframe) - getRevenue(a, timeframe))
    .filter((s) => getRevenue(s, timeframe) > 0)

  const max = sorted.length > 0 ? getRevenue(sorted[0], timeframe) : 1
  const total = sorted.reduce((sum, s) => sum + getRevenue(s, timeframe), 0)

  return (
    <div>
      {/* Timeframe toggle */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {(["d7", "d30", "ytd", "all_time"] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={
              timeframe === tf
                ? { background: "#00ec97", color: "#0e0f0f" }
                : { background: "transparent", color: "#9ca3af", border: "1px solid #374151" }
            }
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
        {total > 0 && (
          <span className="ml-auto text-sm font-semibold text-near-text tabular-nums">
            {formatUSD(total)}
            <span className="text-xs text-near-subtle font-normal ml-1.5">total</span>
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-near-muted py-8 text-center">No revenue data for this period.</p>
      ) : (
        <div className="space-y-5">
          {sorted.map((stream, idx) => {
            const revenue = getRevenue(stream, timeframe)
            const barPct = (revenue / max) * 100
            const sharePct = total > 0 ? (revenue / total) * 100 : 0
            const color = STREAM_COLORS[stream.stream] ?? "#94a3b8"

            return (
              <div key={stream.stream}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs text-near-subtle tabular-nums w-4 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-sm font-medium text-near-text truncate">
                      {stream.stream}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-near-subtle tabular-nums hidden sm:block">
                      {sharePct.toFixed(1)}%
                    </span>
                    <span className="text-sm font-semibold text-near-text tabular-nums min-w-[68px] text-right">
                      {formatUSD(revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-near-border/50 rounded-full overflow-hidden ml-7">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${barPct}%`, background: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
