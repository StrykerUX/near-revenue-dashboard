"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { debugGlow, cn } from "@/lib/utils"
import type { WalletRow } from "@/lib/types"

const ROW_COLORS = ["#FB923C", "#60A5FA", "#A78BFA", "#00EC97"]

function formatNearFull(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 })
}

interface WalletTableProps {
  rows: WalletRow[]
}

export function WalletTable({ rows }: WalletTableProps) {
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
        <h2 className="text-base font-semibold text-near-text">
          Wallet <span className="text-near-green">Breakdown (All-time)</span>
        </h2>
        <p className="text-xs text-near-muted mt-1">Traceable flow of revenue</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-near-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Total NEAR
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-near-subtle uppercase tracking-widest">
                Share
              </th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-near-border">
            {rows.map((row, i) => (
              <tr key={row.name} className="hover:bg-near-card-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: ROW_COLORS[i] ?? "#00EC97" }}
                    />
                    {row.name.includes(".near") ? (
                      <a
                        href={`https://nearblocks.io/es/address/${row.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-near-text text-xs font-mono hover:text-near-green transition-colors"
                      >
                        {row.name}
                      </a>
                    ) : (
                      <span className="text-near-text text-xs">{row.name}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-near-text font-medium tabular-nums">
                  {formatNearFull(row.nearAmount)} NEAR
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-near-muted tabular-nums w-12 text-right">
                      {row.pct.toFixed(1)}%
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-near-border overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: animated ? `${row.share}%` : "0%",
                          backgroundColor: ROW_COLORS[i] ?? "#00EC97",
                          transition: `width 1s ease-out ${i * 0.15}s`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
