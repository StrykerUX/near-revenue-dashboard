export default function Page() {
  return (
    <div className="min-h-screen bg-near-bg flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-near-card border border-near-border flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L14 16L6 24M18 24H26" stroke="#00EC97" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-near-text tracking-tight">
          Work in Progress
        </h1>
        <p className="text-near-muted text-sm max-w-xs leading-relaxed">
          The NEAR Revenue Dashboard is under construction. Check back soon.
        </p>
      </div>
      <div className="w-px h-8 bg-near-border" />
      <p className="text-near-subtle text-xs">near.foundation</p>
    </div>
  )
}
