import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EmissionsSeriesPoint, RevenueSeriesPoint } from "./api"
import type { TimeSeriesPoint } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debugGlow(source: "api" | "static"): { boxShadow?: string } {
  if (process.env.NEXT_PUBLIC_DEBUG_SOURCES !== "true") return {}
  return {
    boxShadow:
      source === "api"
        ? "0 0 0 1px rgba(0,236,151,0.20), 0 0 20px rgba(0,236,151,0.08)"
        : "0 0 0 1px rgba(239,68,68,0.20), 0 0 14px rgba(239,68,68,0.07)",
  }
}

/** Format a NEAR amount as an AnimatedNumber-compatible string (e.g. "1.38M", "345.2K"). */
export function formatNear(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

/** Format a USD amount as an AnimatedNumber-compatible string (e.g. "$34.59M", "$3.76M"). */
export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

/** Convert ISO date "2025-08-01" → "Aug '25" */
export function formatMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-")
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${names[parseInt(month) - 1]} '${year.slice(2)}`
}

/** Convert ISO date "2026-06-04" → "Jun 4" */
export function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${names[parseInt(month) - 1]} ${parseInt(day)}`
}

/** Format ISO datetime "2026-06-04T19:37:39.927127Z" → "Jun 04, 2026" */
export function formatUpdatedAt(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

/** Sum daily emissions_near by month key "YYYY-MM". */
export function aggregateEmissionsByMonth(
  points: EmissionsSeriesPoint[]
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const p of points) {
    const key = p.date_at.slice(0, 7) // "2025-08"
    result[key] = (result[key] ?? 0) + p.emissions_near
  }
  return result
}

/**
 * Compute revenue_near / monthly_emissions * 100 for each month present in both series.
 * Returns TimeSeriesPoint[] with value = ratio %.
 */
export function computeRevenueVsEmissions(
  revenueSeries: RevenueSeriesPoint[],
  monthlyEmissions: Record<string, number>
): TimeSeriesPoint[] {
  return revenueSeries
    .map((p) => {
      const key = p.period_month.slice(0, 7)
      const emissions = monthlyEmissions[key]
      if (!emissions || emissions === 0) return null
      return {
        date: p.period_month,
        value: parseFloat(((p.revenue_near / emissions) * 100).toFixed(2)),
      }
    })
    .filter((p): p is TimeSeriesPoint => p !== null && p.value > 0)
}
