import { Header } from "@/components/sections/header"
import { Hero } from "@/components/sections/hero"
import { StatsGrid } from "@/components/sections/stats-grid"
import { FeesChart } from "@/components/sections/fees-chart"
import { RevenueCharts } from "@/components/sections/revenue-charts"
import { WalletTable } from "@/components/sections/wallet-table"
import { Faq } from "@/components/sections/faq"
import { Footer } from "@/components/sections/footer"
import { fetchDashboardData } from "@/lib/api"
import { formatUSD, formatNear, formatMonthLabel, formatUpdatedAt } from "@/lib/utils"
import { STATS } from "@/lib/data"
import type { StatCard, TimeSeriesPoint, WalletRow } from "@/lib/types"

export default async function Page() {
  const { snapshot, revenueSeries, walletBreakdown } = await fetchDashboardData()

  const snap = snapshot.data

  // ── Hero data ──────────────────────────────────────────────────────────────
  const totalFeesDisplay = formatUSD(snap.total_fees.fees_usd_all_time)
  const feesLast30d = formatNear(snap.total_fees.fees_near_d30)
  const gaugeValue = parseFloat((snap.capture_rate.capture_rate_d30 * 100).toFixed(1))
  const feesChange =
    snap.revenue.revenue_usd_d30_prior > 0
      ? ((snap.revenue.revenue_usd_d30_current - snap.revenue.revenue_usd_d30_prior) /
          snap.revenue.revenue_usd_d30_prior) *
        100
      : 0
  const sparklineData = revenueSeries.map((p) => Math.round(p.revenue_usd))

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats: StatCard[] = [
    {
      label: "Revenue · all-time",
      value: formatUSD(snap.revenue.revenue_usd_all_time),
      unit: "USD",
      sub: "Captured by NEAR",
    },
    ...STATS.slice(1),
  ]

  // ── Revenue chart series ───────────────────────────────────────────────────
  const revenueChartSeries: TimeSeriesPoint[] = revenueSeries.map((p) => ({
    date: formatMonthLabel(p.period_month),
    value: Math.round(p.revenue_usd),
  }))

  // ── Wallet rows ────────────────────────────────────────────────────────────
  const walletRows: WalletRow[] = walletBreakdown.map((item) => ({
    name: item.wallet,
    share: parseFloat((item.share_all_time * 100).toFixed(1)),
    totalRevenue: formatNear(item.inflow_near_all_time),
    pct: parseFloat((item.share_all_time * 100).toFixed(1)),
  }))

  // ── Header timestamp ───────────────────────────────────────────────────────
  const updatedAt = formatUpdatedAt(snapshot.updated_at)

  return (
    <main className="min-h-screen bg-near-bg">
      <Header updatedAt={updatedAt} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <Hero
          totalFeesDisplay={totalFeesDisplay}
          feesLast30d={feesLast30d}
          gaugeValue={gaugeValue}
          feesChange={feesChange}
          sparklineData={sparklineData}
        />
        <StatsGrid stats={stats} />
        <FeesChart />
        <RevenueCharts revenueSeries={revenueChartSeries} />
        <WalletTable rows={walletRows} />
        <Faq />
      </div>
      <Footer />
    </main>
  )
}
