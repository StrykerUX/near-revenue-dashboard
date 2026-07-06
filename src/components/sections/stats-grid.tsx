"use client"

import { useState } from "react"
import { cn, debugGlow } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"
import type { StatCard } from "@/lib/types"

function StatCardItem({
  stat,
  index,
  isSelected,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  stat: StatCard
  index: number
  isSelected: boolean
  isActive: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative rounded-2xl border p-6 flex flex-col gap-1.5 text-left bg-near-card",
        "transition-colors duration-300 ease-out",
        isActive ? "border-near-green/30" : "border-near-border",
      )}
      style={debugGlow(stat.source ?? "static")}
    >
      {/* Soft gradient overlay — fades in on hover/select */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(0,236,151,0.13) 0%, transparent 65%)",
          opacity: isActive ? 1 : 0,
        }}
      />

      {/* Content */}
      <p className="relative text-xs text-near-muted uppercase tracking-widest font-medium">
        + {stat.label}
      </p>
      <div className="relative flex items-baseline gap-2 mt-1">
        <AnimatedNumber
          value={stat.value}
          duration={1.6}
          delay={index * 0.1}
          className={cn(
            "text-3xl font-bold leading-none transition-colors duration-300 ease-out",
            isActive ? "text-near-green" : "text-near-text"
          )}
        />
        {stat.unit && (
          <span className="text-sm text-near-muted font-medium">{stat.unit}</span>
        )}
      </div>
      {stat.change && (
        <p className={cn("relative text-xs font-medium", stat.change.positive ? "text-near-green" : "text-near-red")}>
          {stat.change.positive ? "▲" : "▼"} {stat.change.label}
        </p>
      )}
      <p className="relative text-sm text-near-muted">{stat.sub}</p>
    </button>
  )
}

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <StatCardItem
          key={stat.label}
          stat={stat}
          index={i}
          isSelected={i === selected}
          isActive={i === selected || i === hovered}
          onClick={() => setSelected(i === selected ? null : i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
    </div>
  )
}
