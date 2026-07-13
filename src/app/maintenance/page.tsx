import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Maintenance — NEAR Revenue",
}

function NearWordmark() {
  return <img src="/images/near-full-w.png" alt="NEAR" className="h-5" />
}

export default function MaintenancePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/background-1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(11,13,13,0.3), rgba(11,13,13,1) 90%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(225deg, rgba(11,13,13,0.2), rgba(11,13,13,1))" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md">
        <img
          src="/images/NEAR.png"
          alt="NEAR"
          className="w-14 h-14 rounded-2xl border border-near-border"
        />

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-near-card border border-near-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-xs font-medium text-near-muted">Under maintenance</span>
        </div>

        <h1
          className="text-near-text font-light leading-tight"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          We&rsquo;re updating the dashboard
        </h1>
        <p className="text-near-muted text-sm leading-relaxed">
          NEAR Revenue is undergoing scheduled maintenance. Numbers will be back shortly —
          thanks for your patience.
        </p>

        <div className="w-px h-6 bg-near-border" />

        <Link
          href="/health"
          className="text-xs text-near-subtle hover:text-near-green transition-colors"
        >
          Check API status →
        </Link>

        <NearWordmark />
      </div>
    </main>
  )
}
