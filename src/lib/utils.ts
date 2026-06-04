import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

/** Format ISO datetime "2026-06-04T19:37:39.927127Z" → "Jun 04, 2026" */
export function formatUpdatedAt(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}
