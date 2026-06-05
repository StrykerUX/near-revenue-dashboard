function NearLogo() {
  return (
    <img src="/images/NEAR.png" alt="NEAR" className="w-8 h-8 shrink-0" />
  )
}

export function Header({ updatedAt }: { updatedAt: string }) {
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
        <span className={`text-xs text-near-muted${process.env.NEXT_PUBLIC_DEBUG_SOURCES === "true" ? " ring-2 ring-blue-500/70 rounded px-1" : ""}`}>Updated · {updatedAt}</span>
      </div>
    </header>
  )
}
