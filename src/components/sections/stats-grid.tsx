import { Card } from "@/components/ui/card"
import { STATS } from "@/lib/data"

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATS.map((stat) => (
        <Card key={stat.label} className="flex flex-col gap-1.5">
          <p className="text-xs text-near-muted uppercase tracking-widest font-medium">
            + {stat.label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-near-text leading-none">{stat.value}</span>
            <span className="text-sm text-near-muted font-medium">{stat.unit}</span>
          </div>
          <p className="text-sm text-near-muted">{stat.sub}</p>
        </Card>
      ))}
    </div>
  )
}
