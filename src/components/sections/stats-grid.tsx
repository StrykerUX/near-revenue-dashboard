"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { STATS } from "@/lib/data"

export function StatsGrid() {
  const [selected, setSelected] = useState(0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATS.map((stat, i) => {
        const isSelected = i === selected
        return (
          <button
            key={stat.label}
            onClick={() => setSelected(i)}
            className={cn(
              "rounded-2xl border p-6 flex flex-col gap-1.5 text-left transition-all duration-200",
              isSelected
                ? "border-near-green/30"
                : "border-near-border hover:border-near-border/60 bg-near-card"
            )}
            style={
              isSelected
                ? {
                    background:
                      "radial-gradient(ellipse at top left, rgba(0,236,151,0.13) 0%, transparent 65%), var(--near-card)",
                  }
                : undefined
            }
          >
            <p className="text-xs text-near-muted uppercase tracking-widest font-medium">
              + {stat.label}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <AnimatedNumber
                value={stat.value}
                duration={1.6}
                delay={i * 0.1}
                className={cn(
                  "text-3xl font-bold leading-none",
                  isSelected ? "text-near-green" : "text-near-text"
                )}
              />
              <span className="text-sm text-near-muted font-medium">{stat.unit}</span>
            </div>
            <p className="text-sm text-near-muted">{stat.sub}</p>
          </button>
        )
      })}
    </div>
  )
}
