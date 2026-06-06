import { Header } from "@/components/sections/header"
import { Footer } from "@/components/sections/footer"

// ── Types ──────────────────────────────────────────────────────────────────────

type Status = "dashboard" | "analytics" | "available" | "coming-soon" | "internal"

interface DataItem {
  title: string
  endpoint: string
  what: string
  why: string
  source: string
  status: Status
  fields: string[]
}

interface DataGroup {
  title: string
  description: string
  items: DataItem[]
}

// ── Data catalog ───────────────────────────────────────────────────────────────

const GROUPS: DataGroup[] = [
  {
    title: "Protocol Revenue",
    description:
      "The money NEAR earns after paying out its partners. This is the core financial health signal of the protocol.",
    items: [
      {
        title: "Revenue snapshot",
        endpoint: "/v1/metrics/revenue",
        what: "A point-in-time summary of net revenue across four time windows: last 24h, 7 days, 30 days, and all-time. Available in both NEAR and USD.",
        why: "The fastest way to answer 'how much did NEAR earn recently?' without processing the full history.",
        source: "Onchain",
        status: "dashboard",
        fields: ["revenue_usd_d30", "revenue_usd_d7", "revenue_near_all_time", "revenue_usd_d30_current vs _prior (for % change)"],
      },
      {
        title: "Monthly revenue chart",
        endpoint: "/v1/series/revenue",
        what: "Month-by-month net revenue going back to early 2025, one row per calendar month. Each row includes both NEAR and USD amounts plus a running cumulative total.",
        why: "Drives the bar chart on the dashboard. Makes trend lines and seasonality visible at a glance.",
        source: "Onchain",
        status: "dashboard",
        fields: ["period_month", "revenue_usd", "revenue_near", "cumulative_revenue_usd"],
      },
      {
        title: "Revenue by stream",
        endpoint: "/v1/metrics/revenue-by-stream",
        what: "Net revenue split by where it came from: the NEAR Intents front-end UI, quote improvement captures, authorized business partners, unauthorized partners, and private agreements.",
        why: "Shows which channels drive the most value and how that mix is shifting over time.",
        source: "Onchain",
        status: "analytics",
        fields: ["stream", "revenue_usd_d30", "revenue_usd_d7", "revenue_usd_all_time", "revenue_near_*"],
      },
    ],
  },
  {
    title: "Gross Fees",
    description:
      "The total amount of trading fees generated before any partner payouts. Think of it as NEAR's gross billing — the full economic activity the protocol settles.",
    items: [
      {
        title: "Total fees snapshot",
        endpoint: "/v1/metrics/total-fees",
        what: "A single object with the all-time, YTD, 30-day, 7-day, and 24-hour fee totals in both NEAR and USD. Included inside the /v1/snapshot composite call.",
        why: "Powers the hero number on the dashboard — the headline 'Total Fees Generated' figure.",
        source: "Onchain",
        status: "dashboard",
        fields: ["fees_usd_all_time", "fees_usd_d30", "fees_near_d30", "fees_usd_h24"],
      },
      {
        title: "Cumulative fees chart",
        endpoint: "/v1/series/total-fees",
        what: "Daily time series from 2025 onward with three numbers per day: daily fees in NEAR, daily fees in USD, and the running cumulative total in both currencies.",
        why: "Drives the 'Total Fees Generated' area chart. The growing curve tells the adoption story — how quickly NEAR's economic activity is compounding.",
        source: "Onchain",
        status: "dashboard",
        fields: ["date_at", "total_fees_near", "fees_usd", "cumulative_fees_near", "cumulative_fees_usd"],
      },
    ],
  },
  {
    title: "Capture Rate & Mechanics",
    description:
      "Out of every dollar of fees generated, how much does NEAR keep? Capture rate answers that question. The capture mechanics break it down by the three different ways NEAR retains revenue.",
    items: [
      {
        title: "Capture rate",
        endpoint: "/v1/metrics/capture-rate",
        what: "A single percentage showing what share of gross fees was retained as net revenue, across four time windows plus a 30-day delta (how much it changed vs the prior period).",
        why: "This is the efficiency gauge — it's the circular meter on the dashboard. A rising capture rate means the protocol is getting better at monetizing its activity.",
        source: "Onchain",
        status: "dashboard",
        fields: ["capture_rate_d30", "capture_rate_all_time", "capture_rate_delta_30d"],
      },
      {
        title: "Capture split by mechanism",
        endpoint: "/v1/metrics/capture-split",
        what: "The capture rate broken down by how the revenue was captured: front-end fees (charged directly to users), quote improvement (spread kept when trades beat their quoted price), and B2B partners.",
        why: "Reveals which revenue mechanism is pulling the most weight. Front-end fees are the most direct; quote improvement is the most variable; B2B grows with partnership volume.",
        source: "Onchain",
        status: "analytics",
        fields: ["pp_fe_d30", "pp_qi_d30", "pp_b2b_d30", "…_ytd", "…_all_time", "…_d7 for each"],
      },
    ],
  },
  {
    title: "Confidential TVL & Liquidity",
    description:
      "The assets sitting inside NEAR Intents' confidential pools. These pools are what make private, front-running-resistant swaps possible.",
    items: [
      {
        title: "Confidential TVL series",
        endpoint: "/v1/series/confidential-tvl",
        what: "Daily total value locked in confidential pools, in USD, from launch (Feb 20 2026) to today. The data starts near zero and has grown to over $15 million.",
        why: "The clearest signal of adoption for the confidential swap product. A growing TVL means more traders are using privacy-preserving routing.",
        source: "Dune Analytics (dune:7586891)",
        status: "analytics",
        fields: ["date_at", "tvl_usd", "source_used"],
      },
    ],
  },
  {
    title: "Emissions & Token Economics",
    description:
      "New NEAR tokens are created every day to pay validators. Understanding emissions puts revenue in context — is the protocol generating more value than it inflates?",
    items: [
      {
        title: "Daily emissions",
        endpoint: "/v1/series/emissions",
        what: "The number of new NEAR tokens minted each day as validator rewards, from 2025 to present. Also includes the total supply and a cumulative running total.",
        why: "Used on the dashboard to compute 'Revenue vs Emissions' — if monthly revenue covers a larger share of monthly emissions, the protocol is becoming more economically self-sustaining.",
        source: "Onchain",
        status: "dashboard",
        fields: ["date_at", "emissions_near", "total_supply_near", "cumulative_emissions_near"],
      },
      {
        title: "Revenue vs emissions (pre-computed)",
        endpoint: "/v1/series/revenue-vs-emissions",
        what: "The API can compute the revenue-to-emissions ratio directly, returning revenue_pct_of_emissions per day. The dashboard currently calculates this manually from the two raw series.",
        why: "Switching to this endpoint would simplify the code and let the API own the computation. The data is already there.",
        source: "Onchain",
        status: "available",
        fields: ["date_at", "revenue_near", "emissions_near", "revenue_pct_of_emissions", "cumulative_revenue_pct_of_emissions"],
      },
      {
        title: "NEAR token price",
        endpoint: "/v1/series/price",
        what: "The daily closing price of NEAR in USD, going back as far as the API has data. Sourced from CoinMarketCap.",
        why: "All USD figures across the dashboard are computed by multiplying NEAR amounts by this daily rate. Without price data, everything is NEAR-denominated only.",
        source: "CoinMarketCap",
        status: "analytics",
        fields: ["date_at", "near_price_usd", "source_used"],
      },
    ],
  },
  {
    title: "Wallets & Distribution",
    description:
      "Where does the revenue actually land? These endpoints track the specific onchain wallets that receive protocol funds.",
    items: [
      {
        title: "Wallet revenue breakdown",
        endpoint: "/v1/wallets/breakdown",
        what: "A ranked list of all revenue-receiving wallets with their all-time inflow in NEAR, their 30-day inflow, and their share of total protocol revenue.",
        why: "Shows the distribution of revenue across treasury, team, ecosystem, and buyback wallets. Enables transparency into where protocol money goes.",
        source: "Onchain",
        status: "dashboard",
        fields: ["wallet", "inflow_near_all_time", "inflow_near_d30", "share_all_time", "pct_of_revenue_d30"],
      },
      {
        title: "Buyback program",
        endpoint: "/v1/wallets/buyback",
        what: "Aggregated data on how much NEAR has been bought back using protocol revenue, across all-time, YTD, 30-day, and 7-day windows. Also includes the buyback as a share of total revenue.",
        why: "The buyback program returns value to token holders. This endpoint powers the buyback callout on the dashboard.",
        source: "Onchain",
        status: "dashboard",
        fields: ["buyback_near_all_time", "buyback_near_d30", "pct_of_revenue_d30", "pct_of_revenue_all_time"],
      },
    ],
  },
  {
    title: "Coming Soon / Not Yet Available",
    description:
      "These endpoints exist in the API but either have no data yet or are intended for internal use.",
    items: [
      {
        title: "Offchain revenue",
        endpoint: "/v1/offchain",
        what: "Revenue from partnerships and deals that happen outside the blockchain — for example, licensing agreements or off-chain service fees. The endpoint exists but currently returns an empty array.",
        why: "Once populated, this would complete the full revenue picture by adding non-onchain income streams to the dashboard.",
        source: "Manual input",
        status: "coming-soon",
        fields: ["data: [] (empty)"],
      },
      {
        title: "Pipeline status",
        endpoint: "/v1/status",
        what: "An internal health check showing when each data table was last updated and flagging any discrepancies between data sources (e.g. Dune vs FastNEAR). Not meant for end users.",
        why: "Useful for the data team to monitor freshness and catch sync issues before they show up in the dashboard as stale numbers.",
        source: "Database metadata",
        status: "internal",
        fields: ["freshness[] per table", "reconciliation[] per wallet", "is_stale"],
      },
    ],
  },
]

// ── Status chip ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Status, { label: string; dot: string; chip: string }> = {
  dashboard: {
    label: "On Dashboard",
    dot: "bg-near-green",
    chip: "bg-near-green/10 text-near-green border border-near-green/25",
  },
  analytics: {
    label: "On Analytics",
    dot: "bg-cyan-400",
    chip: "bg-cyan-400/10 text-cyan-400 border border-cyan-400/25",
  },
  available: {
    label: "Available · not shown",
    dot: "bg-amber-400",
    chip: "bg-amber-400/10 text-amber-400 border border-amber-400/25",
  },
  "coming-soon": {
    label: "No data yet",
    dot: "bg-near-subtle",
    chip: "bg-near-border/60 text-near-subtle border border-near-border",
  },
  internal: {
    label: "Internal only",
    dot: "bg-near-subtle",
    chip: "bg-near-border/60 text-near-subtle border border-near-border",
  },
}

function StatusChip({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium shrink-0 ${s.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-near-border text-near-subtle font-mono">
      {label}
    </span>
  )
}

// ── Data item card ─────────────────────────────────────────────────────────────

function DataCard({ item }: { item: DataItem }) {
  const borderColor =
    item.status === "dashboard"
      ? "border-near-green/20"
      : item.status === "analytics"
      ? "border-cyan-400/20"
      : item.status === "available"
      ? "border-amber-400/15"
      : "border-near-border"

  return (
    <div className={`bg-near-card rounded-xl border ${borderColor} p-5 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-near-text mb-1">{item.title}</h3>
          <code className="text-xs text-near-subtle font-mono">{item.endpoint}</code>
        </div>
        <StatusChip status={item.status} />
      </div>

      {/* What / Why */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-near-muted uppercase tracking-wider mb-1">What it is</p>
          <p className="text-xs text-near-subtle leading-relaxed">{item.what}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-near-muted uppercase tracking-wider mb-1">Why it matters</p>
          <p className="text-xs text-near-subtle leading-relaxed">{item.why}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-start justify-between gap-3 pt-1 border-t border-near-border/60">
        <div className="min-w-0">
          <p className="text-xs text-near-subtle mb-1.5 font-medium">Key fields</p>
          <p className="text-xs text-near-subtle/70 font-mono leading-relaxed">
            {item.fields.join(" · ")}
          </p>
        </div>
        <SourceBadge label={item.source} />
      </div>
    </div>
  )
}

// ── Legend ─────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(Object.entries(STATUS_STYLE) as [Status, typeof STATUS_STYLE[Status]][]).map(([, s]) => (
        <span key={s.label} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${s.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DataPage() {
  const totalItems = GROUPS.reduce((sum, g) => sum + g.items.length, 0)
  const connectedCount = GROUPS.flatMap((g) => g.items).filter(
    (i) => i.status === "dashboard" || i.status === "analytics"
  ).length

  return (
    <main className="min-h-screen bg-near-bg">
      <Header
        updatedAt="—"
        nav={[
          { href: "/", label: "Dashboard" },
          { href: "/analytics", label: "Analytics" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section
          className="relative rounded-2xl overflow-hidden px-8 py-12"
          style={{
            backgroundImage: "url('/images/background-1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute -inset-px pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(11,13,13,0.3), rgba(11,13,13,1) 90%)" }}
          />
          <div
            className="absolute -inset-px pointer-events-none"
            style={{ background: "linear-gradient(225deg, rgba(11,13,13,0.2), rgba(11,13,13,1))" }}
          />
          <div className="relative z-10 max-w-2xl">
            <p className="text-near-muted text-xs font-medium tracking-widest uppercase mb-4">
              + Data Guide
            </p>
            <h1
              className="text-near-text font-light leading-none mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              What's in the API
            </h1>
            <p className="text-near-muted text-sm leading-relaxed max-w-lg text-pretty mb-6">
              Everything the NEAR Revenue API can return — explained in plain language.
              {" "}{connectedCount} of {totalItems} data endpoints are currently connected to the dashboard or analytics page.
            </p>
            <Legend />
          </div>
        </section>

        {/* ── Groups ──────────────────────────────────────────────────────── */}
        {GROUPS.map((group) => (
          <section key={group.title}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-near-text mb-1">{group.title}</h2>
              <p className="text-sm text-near-muted leading-relaxed max-w-2xl">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <DataCard key={item.endpoint} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* ── Base URL note ────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-near-border bg-near-card/50 px-6 py-5">
          <p className="text-xs text-near-muted leading-relaxed">
            <strong className="text-near-subtle font-medium">API base URL</strong>{" "}
            <code className="font-mono text-near-subtle mx-1">
              https://revenue-dashboard-api-production.up.railway.app
            </code>
            — All <code className="font-mono text-near-subtle">/v1/*</code> endpoints require an{" "}
            <code className="font-mono text-near-subtle">X-API-Key</code> header. Data is sourced from
            ClickHouse and refreshed approximately every 5 minutes.
          </p>
        </section>

      </div>

      <Footer />
    </main>
  )
}
