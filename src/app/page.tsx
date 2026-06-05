import { Header } from "@/components/sections/header"
import { Hero } from "@/components/sections/hero"
import { StatsGrid } from "@/components/sections/stats-grid"
import { FeesChart } from "@/components/sections/fees-chart"
import { RevenueCharts } from "@/components/sections/revenue-charts"
import { WalletTable } from "@/components/sections/wallet-table"
import { Faq } from "@/components/sections/faq"
import { Footer } from "@/components/sections/footer"
import { fetchDashboardData, type BuybackData } from "@/lib/api"
import { formatUSD, formatNear, formatMonthLabel, formatUpdatedAt, aggregateEmissionsByMonth, computeRevenueVsEmissions } from "@/lib/utils"
import { STATS, REVENUE_MONTHLY, WALLET_ROWS, GAUGE_VALUE, FEES_LAST_30D, TOTAL_FEES_DISPLAY, FEES_CHANGE, SPARKLINE_DATA, EMISSIONS_SERIES } from "@/lib/data"
import type { StatCard, TimeSeriesPoint, WalletRow } from "@/lib/types"

export default async function Page() {
  // ── Fallback values (static data) ─────────────────────────────────────────
  let totalFeesDisplay = TOTAL_FEES_DISPLAY
  let feesLast30d = FEES_LAST_30D
  let gaugeValue = GAUGE_VALUE
  let feesChange = parseFloat(FEES_CHANGE)
  let sparklineData: number[] = SPARKLINE_DATA
  let stats: StatCard[] = STATS
  let revenueChartSeries: TimeSeriesPoint[] = REVENUE_MONTHLY
  let walletRows: WalletRow[] = WALLET_ROWS
  let updatedAt = "—"
  let emissionsMonthly: TimeSeriesPoint[] = EMISSIONS_SERIES
  let emissionsDaily: TimeSeriesPoint[] = EMISSIONS_SERIES
  let buyback: BuybackData | null = null

  try {
    const { snapshot, revenueSeries, walletBreakdown, emissionsDaily: emissionsDailyRaw, buyback: buybackData } = await fetchDashboardData()
    buyback = buybackData
    const snap = snapshot.data

    totalFeesDisplay = formatUSD(snap.total_fees.fees_usd_all_time)
    feesLast30d = formatNear(snap.total_fees.fees_near_d30)
    gaugeValue = parseFloat((snap.capture_rate.capture_rate_d30 * 100).toFixed(1))
    feesChange =
      snap.revenue.revenue_usd_d30_prior > 0
        ? ((snap.revenue.revenue_usd_d30_current - snap.revenue.revenue_usd_d30_prior) /
            snap.revenue.revenue_usd_d30_prior) *
          100
        : 0

    sparklineData = revenueSeries.map((p) => Math.round(p.revenue_usd))

    stats = [
      {
        label: "Revenue · all-time",
        value: formatUSD(snap.revenue.revenue_usd_all_time),
        unit: "USD",
        sub: "Captured by NEAR",
      },
      ...STATS.slice(1),
    ]

    revenueChartSeries = revenueSeries.map((p) => ({
      date: formatMonthLabel(p.period_month),
      value: Math.round(p.revenue_usd),
    }))

    walletRows = walletBreakdown.map((item) => ({
      name: item.wallet,
      share: parseFloat((item.share_all_time * 100).toFixed(1)),
      totalRevenue: formatNear(item.inflow_near_all_time),
      pct: parseFloat((item.share_all_time * 100).toFixed(1)),
    }))

    updatedAt = formatUpdatedAt(snapshot.updated_at)

    const monthlyEmissionsMap = aggregateEmissionsByMonth(emissionsDailyRaw)
    emissionsMonthly = computeRevenueVsEmissions(revenueSeries, monthlyEmissionsMap)
    emissionsDaily = emissionsDailyRaw
      .slice(-90)
      .map((p) => ({ date: p.date_at, value: Math.round(p.emissions_near) }))
  } catch {
    // API unavailable — render with static fallback data
  }

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
        <RevenueCharts
          revenueSeries={revenueChartSeries}
          emissionsMonthly={emissionsMonthly}
          emissionsDaily={emissionsDaily}
        />
        <WalletTable rows={walletRows} buyback={buyback} />
        <Faq />
      </div>
      <Footer />
    </main>
  )
}
