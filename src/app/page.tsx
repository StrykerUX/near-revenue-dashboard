import { SiteLayout } from "@/components/sections/site-layout"
import { Hero } from "@/components/sections/hero"
import { StatsGrid } from "@/components/sections/stats-grid"
import { FeesChart } from "@/components/sections/fees-chart"
import { CumulativeFeesSection, type CumulativeFeesPoint } from "@/components/sections/cumulative-fees-section"
import { TvlChartSection } from "@/components/sections/tvl-chart-section"
import { UniqueUsersSection } from "@/components/sections/unique-users-section"
import { RevenueCharts } from "@/components/sections/revenue-charts"
import { WalletTable } from "@/components/sections/wallet-table"
import { Faq } from "@/components/sections/faq"
import { fetchDashboardData, type BuybackData } from "@/lib/api"
import { formatUSD, formatNear, formatMonthLabel, formatDayLabel, formatUpdatedAt, aggregateEmissionsByMonth, computeRevenueVsEmissions } from "@/lib/utils"
import { STATS, REVENUE_MONTHLY, WALLET_ROWS, GAUGE_VALUE, FEES_LAST_30D, TOTAL_FEES_DISPLAY, FEES_CHANGE, SPARKLINE_DATA, EMISSIONS_SERIES, TOTAL_FEES_SERIES } from "@/lib/data"
import type { StatCard, TimeSeriesPoint, WalletRow } from "@/lib/types"

export default async function Page() {
  // ── Fallback values (static data) ─────────────────────────────────────────
  let totalFeesDisplay = TOTAL_FEES_DISPLAY
  let feesLast30d = FEES_LAST_30D
  let feesLast30dUsd = "$2.83M"
  let gaugeValue = GAUGE_VALUE
  let feesChange = parseFloat(FEES_CHANGE)
  let sparklineData: number[] = SPARKLINE_DATA
  let stats: StatCard[] = STATS.slice(1, 4) // exclude Stablecoin Liquidity Depth (no API yet)
  let revenueChartSeries: TimeSeriesPoint[] = REVENUE_MONTHLY
  let walletRows: WalletRow[] = WALLET_ROWS
  let updatedAt = "—"
  let emissionsMonthly: TimeSeriesPoint[] = EMISSIONS_SERIES
  let emissionsDaily: TimeSeriesPoint[] = EMISSIONS_SERIES
  let buyback: BuybackData | null = null
  let totalFeesSeriesNear: TimeSeriesPoint[] = TOTAL_FEES_SERIES
  let totalFeesSeriesUsd: TimeSeriesPoint[] = TOTAL_FEES_SERIES
  let cumulativeFeesData: CumulativeFeesPoint[] = []
  let tvlChartSeries: TimeSeriesPoint[] = []
  let tvlCurrentUsd = 0
  let tvlGrowthX: string | null = null
  let uniqueUsersD1 = 0
  let uniqueUsersD7 = 0
  let uniqueUsersD30 = 0

  try {
    const { snapshot, revenueSeries, walletBreakdown, emissionsDaily: emissionsDailyRaw, buyback: buybackData, totalFeesSeries: totalFeesRaw, intentVolumeSeries, uniqueUsers, confidentialTvlUsd, tvlSeries: tvlRaw } = await fetchDashboardData()
    buyback = buybackData
    const snap = snapshot.data

    totalFeesDisplay = formatUSD(snap.total_fees.fees_usd_all_time)
    feesLast30d = formatNear(snap.total_fees.fees_near_d30)
    feesLast30dUsd = formatUSD(snap.total_fees.fees_usd_d30)
    gaugeValue = parseFloat((snap.capture_rate.capture_rate_d30 * 100).toFixed(1))
    feesChange =
      snap.revenue.revenue_usd_d30_prior > 0
        ? ((snap.revenue.revenue_usd_d30_current - snap.revenue.revenue_usd_d30_prior) /
            snap.revenue.revenue_usd_d30_prior) *
          100
        : 0

    sparklineData = revenueSeries.map((p) => Math.round(p.revenue_usd))

    const intentVolumeTotal = intentVolumeSeries.length > 0
      ? intentVolumeSeries[intentVolumeSeries.length - 1].cumulative_volume_usd
      : 0

    stats = [
      {
        ...STATS[1],
        value:  intentVolumeTotal > 0 ? formatUSD(intentVolumeTotal) : STATS[1].value,
        source: intentVolumeTotal > 0 ? "api" : "static",
      },
      {
        ...STATS[2],
        value:  confidentialTvlUsd > 0 ? formatUSD(confidentialTvlUsd) : STATS[2].value,
        source: confidentialTvlUsd > 0 ? "api" : "static",
      },
      {
        ...STATS[3],
        value:  uniqueUsers ? formatNear(uniqueUsers.d30) : STATS[3].value,
        source: uniqueUsers ? "api" : "static",
      },
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

    const validFeesNear = totalFeesRaw.filter((p) => p.cumulative_fees_near > 0)
    if (validFeesNear.length > 0) {
      totalFeesSeriesNear = validFeesNear.map((p) => ({
        date: p.date_at,
        value: Math.round(p.cumulative_fees_near),
      }))
    }

    const validFeesUsd = totalFeesRaw.filter((p) => p.cumulative_fees_usd > 0)
    if (validFeesUsd.length > 0) {
      totalFeesSeriesUsd = validFeesUsd.map((p) => ({
        date: p.date_at,
        value: Math.round(p.cumulative_fees_usd),
      }))
    }

    // Unique users
    if (uniqueUsers) {
      uniqueUsersD1  = uniqueUsers.d1
      uniqueUsersD7  = uniqueUsers.d7
      uniqueUsersD30 = uniqueUsers.d30
    }

    // Confidential TVL chart
    const validTvl = tvlRaw.filter(p => p.tvl_usd > 0)
    if (validTvl.length > 0) {
      tvlChartSeries = validTvl.map(p => ({ date: p.date_at, value: p.tvl_usd }))
      tvlCurrentUsd = validTvl[validTvl.length - 1].tvl_usd
      const launchTvl = validTvl[0].tvl_usd
      if (launchTvl > 0) tvlGrowthX = Math.round(tvlCurrentUsd / launchTvl).toLocaleString()
    }

    // Cumulative Fees section — real daily fees split by fee type, cumulative line,
    // plus same-day intent volume joined by date for the tooltip.
    const volumeByDate = new Map(intentVolumeSeries.map((p) => [p.date_at, p.volume_usd]))
    cumulativeFeesData = totalFeesRaw
      .filter((p) => p.fees_usd > 0 && p.total_fees_near > 0)
      .map((p) => {
        // The API gives USD only as a daily total; split it in USD by the NEAR
        // protocol/intents ratio (same-day price applies to both legs).
        const protocolShare = p.protocol_fee_near / p.total_fees_near
        const protocolUsd = p.fees_usd * protocolShare
        return {
          isoDate: p.date_at,
          label: formatDayLabel(p.date_at),
          protocolUsd,
          intentsUsd: p.fees_usd - protocolUsd,
          cumulativeUsd: p.cumulative_fees_usd,
          volumeUsd: volumeByDate.get(p.date_at) ?? 0,
        }
      })
  } catch {
    // API unavailable — render with static fallback data
  }

  return (
    <SiteLayout updatedAt={updatedAt}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <Hero
          totalFeesDisplay={totalFeesDisplay}
          feesLast30d={feesLast30d}
          feesLast30dUsd={feesLast30dUsd}
          gaugeValue={gaugeValue}
          feesChange={feesChange}
          sparklineData={sparklineData}
        />
        <StatsGrid stats={stats} />
        {(uniqueUsersD1 > 0 || uniqueUsersD7 > 0 || uniqueUsersD30 > 0) && (
          <UniqueUsersSection d1={uniqueUsersD1} d7={uniqueUsersD7} d30={uniqueUsersD30} />
        )}
        <FeesChart dataNear={totalFeesSeriesNear} dataUsd={totalFeesSeriesUsd} />
        <CumulativeFeesSection data={cumulativeFeesData} />
        <TvlChartSection data={tvlChartSeries} currentTvl={tvlCurrentUsd} growthX={tvlGrowthX} />
        <RevenueCharts
          revenueSeries={revenueChartSeries}
          emissionsMonthly={emissionsMonthly}
          emissionsDaily={emissionsDaily}
        />

        <Faq />
      </div>
    </SiteLayout>
  )
}
