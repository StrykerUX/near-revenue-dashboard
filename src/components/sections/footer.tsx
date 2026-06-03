function NearWordmark() {
  return (
    <div className="flex items-center gap-1 text-near-muted">
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden>
        <path
          d="M4 16V4l4 5.333L14 4v12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-semibold tracking-wide">near</span>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-near-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="text-xs text-near-subtle leading-relaxed">
            <strong className="text-near-muted font-medium">Data sources.</strong>{" "}
            Pulled directly from on-chain sources, including the NEAR Intents smart contract, and
            updated in real time as transactions are recorded. All fees are denominated in $NEAR.
            Figures shown are illustrative.
          </p>
        </div>
        <NearWordmark />
      </div>
    </footer>
  )
}
