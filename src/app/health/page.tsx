export const dynamic = 'force-dynamic'

import { SiteLayout } from "@/components/sections/site-layout"
import { fetchHealthReport, type EndpointHealth } from "@/lib/api"

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
        ok
          ? "bg-near-green/10 text-near-green border border-near-green/25"
          : "bg-red-400/10 text-red-400 border border-red-400/25"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-near-green" : "bg-red-400"}`} />
      {ok ? "OK" : "Error"}
    </span>
  )
}

function EndpointRow({ endpoint }: { endpoint: EndpointHealth }) {
  return (
    <tr className="border-b border-near-border/60 last:border-0">
      <td className="py-3 pr-4 align-top">
        <p className="text-sm text-near-text font-medium">{endpoint.name}</p>
        <code className="text-xs text-near-subtle font-mono">{endpoint.path}</code>
      </td>
      <td className="py-3 pr-4 align-top"><StatusDot ok={endpoint.ok} /></td>
      <td className="py-3 pr-4 align-top text-sm text-near-subtle font-mono">
        {endpoint.httpStatus ?? "—"}
      </td>
      <td className="py-3 pr-4 align-top text-sm text-near-subtle font-mono">
        {endpoint.latencyMs}ms
      </td>
      <td className="py-3 pr-4 align-top text-sm text-near-subtle font-mono">
        {endpoint.isStale === null ? "—" : endpoint.isStale ? "stale" : "fresh"}
      </td>
      <td className="py-3 pr-4 align-top text-xs text-near-subtle font-mono">
        {endpoint.updatedAt ? formatDate(endpoint.updatedAt) : "—"}
      </td>
      <td className="py-3 align-top text-xs text-red-400/80">
        {endpoint.error ?? ""}
      </td>
    </tr>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HealthPage() {
  const report = await fetchHealthReport()

  const okCount = report.endpoints.filter((e) => e.ok).length
  const total = report.endpoints.length
  const overall =
    okCount === total ? "up" : okCount === 0 ? "down" : "degraded"

  const overallStyle = {
    up:       { label: "All systems operational",              chip: "bg-near-green/10 text-near-green border border-near-green/25", dot: "bg-near-green" },
    degraded: { label: `Degraded — ${total - okCount}/${total} endpoints failing`, chip: "bg-amber-400/10 text-amber-400 border border-amber-400/25", dot: "bg-amber-400" },
    down:     { label: "API unreachable",                       chip: "bg-red-400/10 text-red-400 border border-red-400/25",     dot: "bg-red-400" },
  }[overall]

  return (
    <SiteLayout updatedAt={formatDate(report.checkedAt)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-near-muted text-xs font-medium tracking-widest uppercase mb-4">
            + API Health
          </p>
          <h1
            className="text-near-text font-light leading-none mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Is the API up?
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${overallStyle.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${overallStyle.dot}`} />
              {overallStyle.label}
            </span>
            <span className="text-xs text-near-subtle">
              Checked {formatDate(report.checkedAt)} · live ping, not cached
            </span>
          </div>
        </section>

        {/* ── Endpoint table ──────────────────────────────────────────────── */}
        <section className="bg-near-card rounded-xl border border-near-border overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-near-border text-left">
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Endpoint</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">HTTP</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Latency</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Freshness</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Updated at</th>
                <th className="py-3 px-4 text-xs font-medium text-near-muted uppercase tracking-wider">Error</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {report.endpoints.map((endpoint) => (
                <EndpointRow key={endpoint.path} endpoint={endpoint} />
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Base URL note ───────────────────────────────────────────────── */}
        <section className="rounded-xl border border-near-border bg-near-card/50 px-6 py-5">
          <p className="text-xs text-near-muted leading-relaxed">
            <strong className="text-near-subtle font-medium">API base URL</strong>{" "}
            <code className="font-mono text-near-subtle mx-1">{report.baseUrl}</code>
            — this page pings every endpoint the dashboard depends on directly, with a 10s timeout
            and no cache, so it always reflects live reachability rather than the 5-minute-cached or
            static-fallback view the dashboard itself falls back to.
          </p>
        </section>

      </div>
    </SiteLayout>
  )
}
