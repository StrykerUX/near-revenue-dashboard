"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { SnapshotCaptureSplit } from "@/lib/api"

type Timeframe = "d7" | "d30" | "ytd" | "all_time"

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  d7: "Last 7 days",
  d30: "Last 30 days",
  ytd: "Year to date",
  all_time: "All time",
}

const TIMEFRAME_SHORT: Record<Timeframe, string> = {
  d7: "7d",
  d30: "30d",
  ytd: "YTD",
  all_time: "All-time",
}

type Prefix = "pp_fe" | "pp_qi" | "pp_b2b"

function getVal(data: SnapshotCaptureSplit, prefix: Prefix, tf: Timeframe): number {
  const key = `${prefix}_${tf}` as keyof SnapshotCaptureSplit
  return (data[key] as number) ?? 0
}

function CaptureCard({
  title,
  color,
  prefix,
  data,
  timeframe,
  description,
}: {
  title: string
  color: string
  prefix: Prefix
  data: SnapshotCaptureSplit
  timeframe: Timeframe
  description: string
}) {
  const primary = getVal(data, prefix, timeframe)
  const allTimeframes: Timeframe[] = ["d7", "d30", "ytd", "all_time"]

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-near-muted font-medium uppercase tracking-wider">{title}</span>
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        </div>

        <div className="mb-1">
          <span className="text-4xl font-bold text-near-text tabular-nums">
            {(primary * 100).toFixed(1)}
          </span>
          <span className="text-xl text-near-muted font-light ml-1">%</span>
        </div>
        <p className="text-xs text-near-green/70 mb-4">{TIMEFRAME_LABELS[timeframe]} capture rate</p>

        <div className="h-px bg-near-border mb-3" />

        <div className="space-y-1.5 mb-4">
          {allTimeframes.map((tf) => {
            const val = getVal(data, prefix, tf)
            const isActive = tf === timeframe
            return (
              <div key={tf} className="flex justify-between text-xs">
                <span className={isActive ? "text-near-green/70 font-medium" : "text-near-subtle"}>
                  {TIMEFRAME_SHORT[tf]}
                </span>
                <span className={`tabular-nums font-medium ${isActive ? "text-near-green" : "text-near-muted"}`}>
                  {(val * 100).toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-near-muted leading-relaxed mt-auto">{description}</p>
      </div>
    </Card>
  )
}

export function CaptureSplit({ data }: { data: SnapshotCaptureSplit }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("d30")

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {(["d7", "d30", "ytd", "all_time"] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              timeframe === tf
                ? "bg-near-green/10 text-near-green border border-near-green/25"
                : "text-near-muted hover:text-near-text border border-transparent hover:border-near-border"
            }`}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CaptureCard
          title="Front-end Fees"
          color="#00ec97"
          prefix="pp_fe"
          data={data}
          timeframe={timeframe}
          description="Fees collected directly from end users interacting with the NEAR Intents front-end interface on each swap."
        />
        <CaptureCard
          title="Quote Improvement"
          color="#06b6d4"
          prefix="pp_qi"
          data={data}
          timeframe={timeframe}
          description="Revenue retained when trade execution beats the quoted price — the positive slippage is captured by the protocol instead of being passed to the trader."
        />
        <CaptureCard
          title="B2B Partners"
          color="#8b5cf6"
          prefix="pp_b2b"
          data={data}
          timeframe={timeframe}
          description="Revenue from volume routed through authorized business-to-business partner integrations, governed by formal revenue-sharing agreements."
        />
      </div>
    </div>
  )
}
