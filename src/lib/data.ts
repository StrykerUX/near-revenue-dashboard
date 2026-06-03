import type { TimeSeriesPoint, WalletRow, FaqItem, StatCard } from "./types"

// Cumulative fees over trailing year (May 2025 → May 2026, weekly)
export const TOTAL_FEES_SERIES: TimeSeriesPoint[] = [
  { date: "2025-05-05", value: 180000 },
  { date: "2025-05-12", value: 370000 },
  { date: "2025-05-19", value: 580000 },
  { date: "2025-05-26", value: 800000 },
  { date: "2025-06-02", value: 1050000 },
  { date: "2025-06-09", value: 1320000 },
  { date: "2025-06-16", value: 1610000 },
  { date: "2025-06-23", value: 1920000 },
  { date: "2025-06-30", value: 2260000 },
  { date: "2025-07-07", value: 2620000 },
  { date: "2025-07-14", value: 3010000 },
  { date: "2025-07-21", value: 3420000 },
  { date: "2025-07-28", value: 3860000 },
  { date: "2025-08-04", value: 4330000 },
  { date: "2025-08-11", value: 4830000 },
  { date: "2025-08-18", value: 5360000 },
  { date: "2025-08-25", value: 5920000 },
  { date: "2025-09-01", value: 6320000 },
  { date: "2025-09-08", value: 6870000 },
  { date: "2025-09-15", value: 7450000 },
  { date: "2025-09-22", value: 8060000 },
  { date: "2025-09-29", value: 8700000 },
  { date: "2025-10-06", value: 9370000 },
  { date: "2025-10-13", value: 10070000 },
  { date: "2025-10-20", value: 10800000 },
  { date: "2025-10-27", value: 11560000 },
  { date: "2025-11-03", value: 12200000 },
  { date: "2025-11-10", value: 12940000 },
  { date: "2025-11-17", value: 13710000 },
  { date: "2025-11-24", value: 14510000 },
  { date: "2025-12-01", value: 15340000 },
  { date: "2025-12-08", value: 16200000 },
  { date: "2025-12-15", value: 17090000 },
  { date: "2025-12-22", value: 18010000 },
  { date: "2025-12-29", value: 18700000 },
  { date: "2026-01-05", value: 19450000 },
  { date: "2026-01-12", value: 20000000 },
  { date: "2026-01-19", value: 20580000 },
  { date: "2026-01-26", value: 21180000 },
  { date: "2026-02-02", value: 21600000 },
  { date: "2026-02-09", value: 22000000 },
  { date: "2026-02-16", value: 22350000 },
  { date: "2026-02-23", value: 22580000 },
  { date: "2026-03-03", value: 22700000 },
  { date: "2026-03-10", value: 22780000 },
  { date: "2026-03-17", value: 22810000 },
  { date: "2026-03-24", value: 22820000 },
  { date: "2026-03-31", value: 22825000 },
  { date: "2026-04-07", value: 22828000 },
  { date: "2026-04-14", value: 22829000 },
  { date: "2026-04-21", value: 22830000 },
  { date: "2026-05-01", value: 22830000 },
]

// Monthly revenue after partner payouts (Apr 2025 → Apr 2026)
export const REVENUE_MONTHLY: TimeSeriesPoint[] = [
  { date: "Apr '25", value: 92000 },
  { date: "May '25", value: 115000 },
  { date: "Jun '25", value: 148000 },
  { date: "Jul '25", value: 187000 },
  { date: "Aug '25", value: 224000 },
  { date: "Sep '25", value: 268000 },
  { date: "Oct '25", value: 310000 },
  { date: "Nov '25", value: 355000 },
  { date: "Dec '25", value: 398000 },
  { date: "Jan '26", value: 420000 },
  { date: "Feb '26", value: 445000 },
  { date: "Mar '26", value: 472000 },
  { date: "Apr '26", value: 490000 },
]

// Revenue as % of $NEAR emissions (May 2025 → May 2026, weekly, oscillating)
export const EMISSIONS_SERIES: TimeSeriesPoint[] = Array.from({ length: 52 }, (_, i) => {
  const t = i / 51
  const base = 3 + t * 8
  const wave = Math.sin(i * 0.8) * 2.5 + Math.cos(i * 1.3) * 1.8
  const date = new Date(2025, 4, 5 + i * 7)
  const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  return { date: label, value: Math.max(0.5, base + wave) }
})

// Mini sparkline for the "Fees last 30 days" card
export const SPARKLINE_DATA: number[] = [
  1420000, 1380000, 1450000, 1510000, 1490000, 1560000, 1530000,
  1600000, 1580000, 1640000, 1690000, 1720000, 1700000, 1760000,
  1740000, 1800000, 1780000, 1820000, 1850000, 1840000,
]

export const WALLET_ROWS: WalletRow[] = [
  { name: "fefundsadmin.sputnik-dao.near", share: 56, totalRevenue: "1.83M", pct: 56.0 },
  { name: "1csfundsadmin.sputnik-dao.near", share: 29, totalRevenue: "948.3K", pct: 29.0 },
  { name: "buybacks.multisignature.near", share: 15, totalRevenue: "490.5K", pct: 15.0 },
]

export const STATS: StatCard[] = [
  { label: "Revenue · all-time", value: "3.27M", unit: "NEAR", sub: "Captured by NEAR" },
  { label: "Revenue · YTD", value: "1.92M", unit: "NEAR", sub: "Captured this year" },
  { label: "Revenue · 30D", value: "351.8K", unit: "NEAR", sub: "Captured in last 30 days" },
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
      "NEAR Protocol base fees are transaction fees paid by users for on-chain activity. A portion of these fees is burned and a portion is allocated as protocol revenue, depending on the transaction type.",
  },
  {
    id: "05",
    question: "Where does the data come from?",
    answer:
      "Data is pulled directly from on-chain sources, including the NEAR Intents smart contract, and updated in real time as transactions are recorded. All fees are denominated in $NEAR. Figures shown are illustrative.",
  },
  {
    id: "06",
    question: "Where can I learn more about NEAR's tokenomics?",
    answer:
      "You can learn more about NEAR's tokenomics at near.org/tokenomics or in the official NEAR whitepaper. The NEAR Foundation publishes quarterly treasury reports with detailed breakdowns.",
  },
]

export const GAUGE_VALUE = 14.3
export const FEES_LAST_30D = "1.84M"
export const TOTAL_FEES_DISPLAY = "22.83M"
export const FEES_CHANGE = "11.3"
