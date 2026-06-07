"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { debugGlow } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"
import type { WalletRow } from "@/lib/types"
import type { BuybackData } from "@/lib/api"
import { formatNear } from "@/lib/utils"

interface WalletTableProps {
  rows: WalletRow[]
  buyback: BuybackData | null
}

export function WalletTable({ rows, buyback }: WalletTableProps) {
  const [animated, setAnimated] = useState(false)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)

  useEffect(() => {
    const el = tbodyRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          setAnimated(true)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Card padding="none" className="overflow-hidden" style={debugGlow("api")}>
      <div className="p-6 pb-4">
        <h2 className="text-base font-semibold text-near-text mb-1">Revenue wallet breakdown</h2>
        <p className="text-xs text-near-muted">
          All-time revenue distributed across NEAR&apos;s onchain revenue wallets.
        </p>
      </div>

      {buyback && (
        <div className="mx-6 mb-4 rounded-xl border border-near-border bg-near-card px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-near-muted">
            In the last 30 days,{" "}
            <span className="text-near-green font-medium">
              {(buyback.pct_of_revenue_d30 * 100).toFixed(1)}% of revenue
            </span>{" "}
            went to buybacks
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-near-subtle">30d</p>
              <p className="text-sm font-medium text-near-text">{formatNear(buyback.buyback_near_d30)} NEAR</p>
            </div>
            <div className="w-px h-8 bg-near-border" />
            <div className="text-right">
              <p className="text-xs text-near-subtle">All-time</p>
              <p className="text-sm font-medium text-near-text">{formatNear(buyback.buyback_near_all_time)} NEAR</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-near-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Share
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-near-subtle uppercase tracking-widest">
                Total revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-near-subtle uppercase tracking-widest">
                % of revenue
              </th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-near-border">
            {rows.map((row, i) => (
              <tr key={row.name} className="hover:bg-near-card-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-near-green shrink-0" />
                    <span className="text-near-text font-mono text-xs">{row.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 h-1.5 rounded-full bg-near-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-near-green"
                      style={{
                        width: animated ? `${row.share}%` : "0%",
                        transition: `width 1s ease-out ${i * 0.15}s`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <AnimatedNumber
                    value={row.totalRevenue + ""}
                    duration={1.4}
                    delay={i * 0.1}
                    className="text-near-text font-medium"
                  />
                  <span className="text-near-subtle text-xs ml-1">NEAR</span>
                </td>
                <td className="px-6 py-4 text-right text-near-muted">
                  <AnimatedNumber
                    value={row.pct.toFixed(1) + "%"}
                    duration={1.4}
                    delay={i * 0.1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
