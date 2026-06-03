import { Card } from "@/components/ui/card"
import { WALLET_ROWS } from "@/lib/data"

export function WalletTable() {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-base font-semibold text-near-text mb-1">Revenue wallet breakdown</h2>
        <p className="text-xs text-near-muted">
          All-time revenue distributed across NEAR&apos;s on-chain revenue wallets.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-near-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-near-subtle uppercase tracking-widest">
                Share
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-near-subtle uppercase tracking-widest">
                Total revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-near-subtle uppercase tracking-widest">
                % of revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-near-border">
            {WALLET_ROWS.map((row) => (
              <tr key={row.name} className="hover:bg-near-card-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-near-green shrink-0" />
                    <span className="text-near-text font-mono text-xs">{row.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 h-1.5 rounded-full bg-near-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-near-green"
                      style={{ width: `${row.share}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-near-text font-medium">{row.totalRevenue}</span>
                  <span className="text-near-subtle text-xs ml-1">NEAR</span>
                </td>
                <td className="px-6 py-4 text-right text-near-muted">{row.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
