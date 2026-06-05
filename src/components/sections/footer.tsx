function NearWordmark() {
  return (
    <img src="/images/near-full-w.png" alt="NEAR" className="h-5" />
  )
}

export function Footer() {
  return (
    <footer className="border-t border-near-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="text-xs text-near-subtle leading-relaxed">
            <strong className="text-near-muted font-medium">Data sources.</strong>{" "}
            Pulled directly from onchain sources, including the NEAR Intents smart contract, and
            updated in real time as transactions are recorded. All fees are denominated in $NEAR.
            Figures shown are illustrative.
          </p>
        </div>
        <NearWordmark />
      </div>
    </footer>
  )
}
