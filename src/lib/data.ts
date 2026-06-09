import type { TimeSeriesPoint, WalletRow, FaqItem, StatCard } from "./types"
import type { SwapDataPoint } from "@/components/charts/stacked-bar-chart"

// Cumulative fees — hockey-stick power curve (flat early, accelerates from Oct 2025)
// 53 points so the last tick lands in May 2026
function buildFeesSeries(): TimeSeriesPoint[] {
  const target = 22_830_000
  const startMs = new Date(2025, 4, 1).getTime() // May 1 2025
  return Array.from({ length: 53 }, (_, i) => {
    const date = new Date(startMs + i * 7 * 86400000).toISOString().slice(0, 10)
    const t = i / 52
    const value = Math.round(target * Math.pow(t, 2.8))
    return { date, value }
  })
}
export const TOTAL_FEES_SERIES: TimeSeriesPoint[] = buildFeesSeries()

// Monthly revenue after partner payouts (Apr 2025 → Apr 2026)
export const REVENUE_MONTHLY: TimeSeriesPoint[] = [
  { date: "Apr '25", value: 52000 },
  { date: "May '25", value: 78000 },
  { date: "Jun '25", value: 105000 },
  { date: "Jul '25", value: 138000 },
  { date: "Aug '25", value: 172000 },
  { date: "Sep '25", value: 210000 },
  { date: "Oct '25", value: 255000 },
  { date: "Nov '25", value: 305000 },
  { date: "Dec '25", value: 358000 },
  { date: "Jan '26", value: 398000 },
  { date: "Feb '26", value: 438000 },
  { date: "Mar '26", value: 465000 },
  { date: "Apr '26", value: 490000 },
]

// Revenue as % of $NEAR emissions — starts low/flat, oscillations grow over time
export const EMISSIONS_SERIES: TimeSeriesPoint[] = Array.from({ length: 53 }, (_, i) => {
  const t = i / 52
  const base = 0.4 + t * 3.5
  const amplitude = 0.2 + t * 7.5
  const wave = Math.sin(i * 1.9) * amplitude * 0.65 + Math.cos(i * 1.2) * amplitude * 0.35
  const date = new Date(new Date(2025, 4, 1).getTime() + i * 7 * 86400000).toISOString().slice(0, 10)
  return { date, value: Math.max(0.1, base + wave) }
})

// Mini sparkline — descending trend (\) with oscillations, more data points for density
export const SPARKLINE_DATA: number[] = Array.from({ length: 40 }, (_, i) => {
  const t = i / 39
  const base = 2050000 - t * 680000   // descends from ~2.05M to ~1.37M
  const amp = 95000 + t * 40000       // amplitude grows slightly
  const wave = Math.sin(i * 1.7) * amp + Math.cos(i * 0.9) * amp * 0.4
  return Math.round(Math.max(1100000, base + wave))
})

export const WALLET_ROWS: WalletRow[] = [
  { name: "fefundsadmin.sputnik-dao.near", share: 56, totalRevenue: "1.83M", pct: 56.0 },
  { name: "1csfundsadmin.sputnik-dao.near", share: 29, totalRevenue: "948.3K", pct: 29.0 },
  { name: "buybacks.multisignature.near", share: 15, totalRevenue: "490.5K", pct: 15.0 },
]

export const STATS: StatCard[] = [
  { label: "Revenue · all-time",             value: "3.27M",    unit: "NEAR",    sub: "Captured by NEAR",                           source: "static" },
  { label: "Intent Volume · all-time",        value: "$20.44B",  unit: "Dollars", sub: "Routed and settled through NEAR Intents",                   source: "static" },
  { label: "Confidential TVL · Now",          value: "$15.53M",  unit: "Dollars", sub: "NEAR Intents Confidential TVL",       source: "static" },
  { label: "Unique Users · 30D",              value: "552.7K",   unit: "",        sub: "Users who expressed an intent",                source: "static" },
  { label: "Stablecoin Liquidity Depth · Now",value: "$1M",      unit: "Dollars", sub: "Max Swap size on NEAR Intents",               source: "static" },
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "01",
    question: "What's the difference between Total Fees and Revenue?",
    answer:
      "Total Fees is the gross amount collected across NEAR Protocol and NEAR Intents activity. Revenue is the portion captured by NEAR after payouts to integration partners, solvers, and dApps. The gap is fees distributed to ecosystem participants under NEAR's revenue-sharing model.",
  },
  {
    id: "02",
    question: "How are fee splits determined?",
    answer:
      "Fee splits are defined in protocol governance and partner agreements. Each integration partner negotiates a share of fees routed through their interface, with the remainder captured as protocol revenue.",
  },
  {
    id: "03",
    question: "What fees does NEAR Intents charge?",
    answer:
      "NEAR Intents charges a small fee on every swap settled through the protocol. The fee is taken from the output amount and distributed across solvers, integration partners, and NEAR Protocol.",
  },
  {
    id: "04",
    question: "What about NEAR Protocol base fees?",
    answer:
      "NEAR Protocol base fees are transaction fees paid by users for onchain activity. A portion of these fees is burned and a portion is allocated as protocol revenue, depending on the transaction type.",
  },
  {
    id: "05",
    question: "Where does the data come from?",
    answer:
      "Data is pulled directly from onchain sources, including the NEAR Intents smart contract, and updated in real time as transactions are recorded. All fees are denominated in NEAR. Figures shown are illustrative.",
  },
  {
    id: "06",
    question: "Where can I learn more about NEAR's tokenomics?",
    answer:
      "You can learn more about NEAR's tokenomics at near.org/tokenomics or in the official NEAR whitepaper. The NEAR Foundation publishes quarterly treasury reports with detailed breakdowns.",
  },
]

export const CONFIDENTIAL_TVL: TimeSeriesPoint[] = [
  { date: "Apr '25", value: 8000 },
  { date: "May '25", value: 95000 },
  { date: "Jun '25", value: 120000 },
  { date: "Jul '25", value: 148000 },
  { date: "Aug '25", value: 178000 },
  { date: "Sep '25", value: 215000 },
  { date: "Oct '25", value: 258000 },
  { date: "Nov '25", value: 370000 },
  { date: "Dec '25", value: 355000 },
  { date: "Jan '26", value: 390000 },
  { date: "Feb '26", value: 420000 },
  { date: "Mar '26", value: 375000 },
  { date: "Apr '26", value: 290000 },
]

export const SWAP_BREAKDOWN: SwapDataPoint[] = [
  { date: "Apr '25", confidential: 5000, normal: 0 },
  { date: "May '25", confidential: 80000, normal: 25000 },
  { date: "Jun '25", confidential: 105000, normal: 30000 },
  { date: "Jul '25", confidential: 128000, normal: 35000 },
  { date: "Aug '25", confidential: 145000, normal: 45000 },
  { date: "Sep '25", confidential: 175000, normal: 50000 },
  { date: "Oct '25", confidential: 210000, normal: 60000 },
  { date: "Nov '25", confidential: 245000, normal: 80000 },
  { date: "Dec '25", confidential: 260000, normal: 95000 },
  { date: "Jan '26", confidential: 270000, normal: 100000 },
  { date: "Feb '26", confidential: 255000, normal: 105000 },
  { date: "Mar '26", confidential: 240000, normal: 95000 },
  { date: "Apr '26", confidential: 200000, normal: 90000 },
]

export const GAUGE_VALUE = 30.9
export const FEES_LAST_30D = "352.6K"
export const TOTAL_FEES_DISPLAY = "$34.84M"
export const FEES_CHANGE = "121.1"
