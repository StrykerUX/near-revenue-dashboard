"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"
import type { StatCard } from "@/lib/types"

function StatCardItem({ stat, index, isSelected, onClick }: {
  stat: StatCard
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
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
          delay={index * 0.1}
          className={cn(
            "text-3xl font-bold leading-none",
            isSelected ? "text-near-green" : "text-near-text"
          )}
        />
        {stat.unit && (
          <span className="text-sm text-near-muted font-medium">{stat.unit}</span>
        )}
      </div>
      <p className="text-sm text-near-muted">{stat.sub}</p>
    </button>
  )
}

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  const [selected, setSelected] = useState(0)

  const topRow = stats.slice(0, 3)
  const bottomRow = stats.slice(3)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topRow.map((stat, i) => (
          <StatCardItem
            key={stat.label}
            stat={stat}
            index={i}
            isSelected={i === selected}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hidden md:block" />
        {bottomRow.map((stat, i) => (
          <StatCardItem
            key={stat.label}
            stat={stat}
            index={i + 3}
            isSelected={i + 3 === selected}
            onClick={() => setSelected(i + 3)}
          />
        ))}
      </div>
    </div>
  )
}
