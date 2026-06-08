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

export interface SnapshotCaptureSplit {
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

// ─── Total Fees series types ──────────────────────────────────────────────────

export interface TotalFeesSeriesPoint {
  date_at: string
  total_fees_near: number
  protocol_fee_near: number
  intents_revenue_near: number
  burn_revenue_near: number
  cumulative_fees_near: number
  fees_usd: number
  cumulative_fees_usd: number
}

// ─── Intent Volume series types ────────────────────────────────────────────────

export interface IntentVolumePoint {
  date_at: string
  volume_usd: number
  cumulative_volume_usd: number
  is_stale: number
}

// ─── Unique Users types ───────────────────────────────────────────────────────

export interface UniqueUsersData {
  d1: number
  d7: number
  d30: number
  snapshot_date: string
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

// ─── Analytics types ──────────────────────────────────────────────────────────

export interface PricePoint {
  date_at: string
  near_price_usd: number
  source_used: string
  is_stale: number
}

export interface ConfidentialTvlPoint {
  date_at: string
  tvl_usd: number
  source_used: string
  is_stale: number
}

export interface RevenueStreamItem {
  stream: string
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
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": API_KEY },
      next: { revalidate: 300 },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
    return res.json() as Promise<Envelope<T>>
  } finally {
    clearTimeout(timeout)
  }
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

export function fetchTotalFeesSeries() {
  const to = new Date().toISOString().slice(0, 10)
  return apiFetch<TotalFeesSeriesPoint[]>("/v1/series/total-fees", {
    from: "2025-01-01",
    to,
    grain: "day",
  })
}

export function fetchIntentVolumeSeries() {
  const to = new Date().toISOString().slice(0, 10)
  return apiFetch<IntentVolumePoint[]>("/v1/series/intent-volume", {
    from: "2025-01-01",
    to,
    grain: "day",
  })
}

export function fetchUniqueUsers() {
  return apiFetch<UniqueUsersData>("/v1/metrics/unique-users")
}

export function fetchPriceSeries() {
  const to = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return apiFetch<PricePoint[]>("/v1/series/price", { from, to, grain: "day" })
}

export function fetchConfidentialTvlSeries() {
  const to = new Date().toISOString().slice(0, 10)
  return apiFetch<ConfidentialTvlPoint[]>("/v1/series/confidential-tvl", {
    from: "2026-01-01",
    to,
    grain: "day",
  })
}

// Lightweight fetch — just the last 3 days to get the current TVL scalar for the stat card.
export function fetchConfidentialTvlLatest() {
  const to = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return apiFetch<ConfidentialTvlPoint[]>("/v1/series/confidential-tvl", { from, to, grain: "day" })
}

export function fetchRevenueByStream() {
  return apiFetch<RevenueStreamItem[]>("/v1/metrics/revenue-by-stream")
}

export function fetchCaptureSplit() {
  return apiFetch<SnapshotCaptureSplit>("/v1/metrics/capture-split")
}

// ─── Analytics composite fetch ────────────────────────────────────────────────

export interface AnalyticsData {
  priceSeries: PricePoint[]
  tvlSeries: ConfidentialTvlPoint[]
  revenueStreams: RevenueStreamItem[]
  captureSplit: SnapshotCaptureSplit
  uniqueUsers: UniqueUsersData | null
  intentVolumeSeries: IntentVolumePoint[]
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const [priceEnv, tvlEnv, streamsEnv, splitEnv, uniqueUsersEnv, intentVolumeEnv] = await Promise.all([
    fetchPriceSeries(),
    fetchConfidentialTvlSeries(),
    fetchRevenueByStream(),
    fetchCaptureSplit(),
    fetchUniqueUsers(),
    fetchIntentVolumeSeries(),
  ])
  return {
    priceSeries: priceEnv.data,
    tvlSeries: tvlEnv.data,
    revenueStreams: streamsEnv.data,
    captureSplit: splitEnv.data,
    uniqueUsers: uniqueUsersEnv.data,
    intentVolumeSeries: intentVolumeEnv.data,
  }
}

// ─── Composite dashboard fetch ────────────────────────────────────────────────

export interface DashboardData {
  snapshot: Envelope<SnapshotData>
  revenueSeries: RevenueSeriesPoint[]
  emissionsDaily: EmissionsSeriesPoint[]
  totalFeesSeries: TotalFeesSeriesPoint[]
  intentVolumeSeries: IntentVolumePoint[]
  uniqueUsers: UniqueUsersData | null
  confidentialTvlUsd: number
  tvlSeries: ConfidentialTvlPoint[]
  revenueStreams: RevenueStreamItem[]
  captureSplit: SnapshotCaptureSplit | null
}

// Unwraps the envelope data and returns a fallback if the call fails.
function safe<T>(p: Promise<Envelope<T>>, fallback: T): Promise<T> {
  return p.then(r => r.data).catch(() => fallback)
}


export async function fetchDashboardData(): Promise<DashboardData> {
  // fetchSnapshot is the only critical call — if it fails the page falls back
  // entirely to static data. All other calls are fault-tolerant: a timeout or
  // API error returns an empty fallback so the rest of the page still renders
  // with live data.
  const [
    snapshot,
    revenueSeries,
    emissionsDaily,
    totalFeesSeries,
    intentVolumeSeries,
    uniqueUsers,
    tvlSeries,
    revenueStreams,
    captureSplit,
  ] = await Promise.all([
    fetchSnapshot(),
    safe(fetchRevenueSeries(),           []),
    safe(fetchEmissionsSeries(),         []),
    safe(fetchTotalFeesSeries(),         []),
    safe(fetchIntentVolumeSeries(),      []),
    safe(fetchUniqueUsers(),             null),
    safe(fetchConfidentialTvlSeries(),   []),
    safe(fetchRevenueByStream(),         []),
    fetchCaptureSplit().then(r => r.data).catch(() => null),
  ])

  const latestTvl = (tvlSeries as ConfidentialTvlPoint[])
    .filter(p => p.tvl_usd > 0).pop()?.tvl_usd ?? 0

  return {
    snapshot,
    revenueSeries:      revenueSeries      as RevenueSeriesPoint[],
    emissionsDaily:     emissionsDaily     as EmissionsSeriesPoint[],
    totalFeesSeries:    totalFeesSeries    as TotalFeesSeriesPoint[],
    intentVolumeSeries: intentVolumeSeries as IntentVolumePoint[],
    uniqueUsers:        uniqueUsers        as UniqueUsersData | null,
    confidentialTvlUsd: latestTvl,
    tvlSeries:          tvlSeries          as ConfidentialTvlPoint[],
    revenueStreams:      revenueStreams      as RevenueStreamItem[],
    captureSplit:        captureSplit       as SnapshotCaptureSplit | null,
  }
}
