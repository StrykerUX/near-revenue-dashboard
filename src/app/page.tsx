import { Header } from "@/components/sections/header"
import { Hero } from "@/components/sections/hero"
import { StatsGrid } from "@/components/sections/stats-grid"
import { FeesChart } from "@/components/sections/fees-chart"
import { RevenueCharts } from "@/components/sections/revenue-charts"
import { WalletTable } from "@/components/sections/wallet-table"
import { Faq } from "@/components/sections/faq"
import { Footer } from "@/components/sections/footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-near-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <Hero />
        <StatsGrid />
        <FeesChart />
        <RevenueCharts />
        <WalletTable />
        <Faq />
      </div>
      <Footer />
    </main>
  )
}
