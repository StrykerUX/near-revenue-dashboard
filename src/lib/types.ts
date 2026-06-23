export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface RevenueBarPoint {
  date: string
  value: number
  cumulative: number
}

export interface WalletRow {
  name: string
  nearAmount: number
  share: number
  pct: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  link?: { href: string; label: string }
}

export interface StatCard {
  label: string
  value: string
  unit: string
  sub: string
  source?: "api" | "static"
}
