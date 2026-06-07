export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface WalletRow {
  name: string
  share: number
  totalRevenue: string
  pct: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface StatCard {
  label: string
  value: string
  unit: string
  sub: string
  source?: "api" | "static"
}
