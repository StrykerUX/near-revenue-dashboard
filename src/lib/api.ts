const BASE_URL =
  process.env.NEAR_API_BASE_URL ??
  "https://revenue-dashboard-api-production.up.railway.app"
const API_KEY = process.env.NEAR_API_KEY ?? ""

// ─── Envelope wrapper ────────────────────────────────────────────────────────

export interface Envelope<T> {
  metric: string
  as_of: string | null
  data: T
  denomination: string | null
  is_stale: boolean
  updated_at: string
}

// ─── Snapshot types ───────────────────────────────────────────────────────────

interface SnapshotTotalFees {
  fees_usd_all_time: number
  fees_usd_ytd: number
  fees_usd_d30: number
  fees_usd_d7: number
  fees_usd_h24: number
  fees_usd_is_stale: number
  fees_near_all_time: number
  fees_near_ytd: number
  fees_near_d30: number
  fees_near_d7: number
  fees_near_h24: number
  fees_near_is_stale: number
}

interface SnapshotRevenue {
  revenue_usd_all_time: number
  revenue_usd_ytd: number
  revenue_usd_d30: number
  revenue_usd_d7: number
  revenue_usd_h24: number
  revenue_near_all_time: number
  revenue_near_ytd: number
  revenue_near_d30: number
  revenue_near_d7: number
  revenue_near_h24: number
  revenue_usd_d30_current: number
  revenue_usd_d30_prior: number
  is_stale: number
}

interface SnapshotCaptureRate {
  capture_rate_all_time: number
  capture_rate_ytd: number
  capture_rate_d30: number
  capture_rate_d7: number
  capture_rate_h24: number | null
  capture_rate_delta_30d: number
  is_stale: number
}

interface SnapshotCaptureSplit {
  pp_fe_all_time: number
  pp_fe_ytd: number
  pp_fe_d30: number
  pp_fe_d7: number
  pp_b2b_all_time: number
  pp_b2b_ytd: number
  pp_b2b_d30: number
  pp_b2b_d7: number
  pp_qi_all_time: number
  pp_qi_ytd: number
  pp_qi_d30: number
  pp_qi_d7: number
  is_stale: number
}

export interface SnapshotData {
  total_fees: SnapshotTotalFees
  revenue: SnapshotRevenue
  capture_rate: SnapshotCaptureRate
  capture_split: SnapshotCaptureSplit
}

// ─── Series types ─────────────────────────────────────────────────────────────

export interface RevenueSeriesPoint {
  period_month: string
  revenue_usd: number
  revenue_near: number
  cumulative_revenue_usd: number
  cumulative_revenue_near: number
  is_stale: number
}

// ─── Buyback types ───────────────────────────────────────────────────────────

export interface BuybackData {
  buyback_near_all_time: number
  buyback_near_ytd: number
  buyback_near_d30: number
  buyback_near_d7: number
  pct_of_revenue_all_time: number
  pct_of_revenue_ytd: number
  pct_of_revenue_d30: number
  pct_of_revenue_d7: number
  is_stale: number
}

// ─── Emissions types ──────────────────────────────────────────────────────────

export interface EmissionsSeriesPoint {
  date_at: string
  emissions_near: number
  total_supply_near: number
  cumulative_emissions_near: number
  source_used: string
  is_stale: number
}

// ─── Wallet types ─────────────────────────────────────────────────────────────

export interface WalletBreakdownItem {
  wallet: string
  inflow_near_all_time: number
  inflow_near_d30: number
  share_all_time: number
  share_d30: number
  pct_of_revenue_all_time: number
  pct_of_revenue_d30: number
  is_stale: number
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<Envelope<T>> {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  return res.json() as Promise<Envelope<T>>
}

// ─── Individual fetchers ──────────────────────────────────────────────────────

export function fetchSnapshot() {
  return apiFetch<SnapshotData>("/v1/snapshot", { denomination: "usd" })
}

export function fetchRevenueSeries() {
  const to = new Date().toISOString().slice(0, 10)
  return apiFetch<RevenueSeriesPoint[]>("/v1/series/revenue", {
    from: "2025-01-01",
    to,
    grain: "month",
  })
}

export function fetchWalletBreakdown() {
  return apiFetch<WalletBreakdownItem[]>("/v1/wallets/breakdown")
}

export function fetchBuyback() {
  return apiFetch<BuybackData>("/v1/wallets/buyback")
}

export function fetchEmissionsSeries() {
  const to = new Date().toISOString().slice(0, 10)
  return apiFetch<EmissionsSeriesPoint[]>("/v1/series/emissions", {
    from: "2025-01-01",
    to,
  })
}

// ─── Composite dashboard fetch ────────────────────────────────────────────────

export interface DashboardData {
  snapshot: Envelope<SnapshotData>
  revenueSeries: RevenueSeriesPoint[]
  walletBreakdown: WalletBreakdownItem[]
  emissionsDaily: EmissionsSeriesPoint[]
  buyback: BuybackData
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [snapshot, revenueEnv, walletEnv, emissionsEnv, buybackEnv] = await Promise.all([
    fetchSnapshot(),
    fetchRevenueSeries(),
    fetchWalletBreakdown(),
    fetchEmissionsSeries(),
    fetchBuyback(),
  ])
  return {
    snapshot,
    revenueSeries: revenueEnv.data,
    walletBreakdown: walletEnv.data,
    emissionsDaily: emissionsEnv.data,
    buyback: buybackEnv.data,
  }
}
