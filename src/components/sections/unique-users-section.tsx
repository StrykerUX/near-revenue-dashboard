import { AnimatedNumber } from "@/components/ui/animated-number"
import { debugGlow } from "@/lib/utils"

interface UniqueUsersSectionProps {
  d1: number
  d7: number
  d30: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function Window({
  value,
  label,
  index,
}: {
  value: number
  label: string
  index: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <AnimatedNumber
        value={fmt(value)}
        duration={1.6}
        delay={index * 0.15}
        className="text-2xl font-bold text-near-text leading-none"
      />
      <p className="text-xs text-near-muted">{label}</p>
    </div>
  )
}

export function UniqueUsersSection({ d1, d7, d30 }: UniqueUsersSectionProps) {
  return (
    <div
      className="rounded-2xl border border-near-border bg-near-card px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-6"
      style={debugGlow("api")}
    >
      <div className="shrink-0">
        <p className="text-xs text-near-muted uppercase tracking-widest font-medium mb-0.5">
          + Unique Users
        </p>
        <p className="text-xs text-near-subtle leading-relaxed max-w-xs">
          Distinct wallets that interacted with NEAR Intents. Source: Dune Analytics.
        </p>
      </div>

      <div className="h-px sm:h-10 sm:w-px bg-near-border shrink-0" />

      <div className="flex items-center gap-8 sm:gap-12 flex-wrap">
        <Window value={d1}  label="Last 24 hours"  index={0} />
        <Window value={d7}  label="Last 7 days"    index={1} />
        <Window value={d30} label="Last 30 days"   index={2} />
      </div>
    </div>
  )
}
