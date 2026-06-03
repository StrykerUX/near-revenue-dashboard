function NearLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-near-green flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
        {/* NEAR "N" mark: left bar, diagonal from top-left to bottom-right, right bar */}
        <path
          d="M6 18V6l12 12V6"
          stroke="#0B0D0D"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-near-border">
      <div className="flex items-center gap-3">
        <NearLogo />
        <div>
          <h1 className="font-semibold text-near-text text-sm leading-tight">NEAR Revenue</h1>
          <p className="text-xs text-near-muted leading-tight">Protocol & product revenue tracker</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-near-green" />
        <span className="text-xs text-near-muted">Updated · May 27, 2026</span>
      </div>
    </header>
  )
}
