import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ECOSYSTEM_INTERFACES, ECOSYSTEM_CHAINS } from "@/lib/data"

function LogoBadge({
  name,
  logo,
  className,
  size = 53,
  imgRatio = 31 / 53,
}: {
  name: string
  logo: string
  className?: string
  size?: number
  imgRatio?: number
}) {
  const imgSize = Math.round(size * imgRatio)
  return (
    <div
      className={cn(
        "rounded-full bg-near-border flex items-center justify-center shrink-0 overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
      title={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- project convention: inline logos, no next/image (see CLAUDE.md) */}
      <img src={logo} alt={name} width={imgSize} height={imgSize} className="object-contain" />
    </div>
  )
}

export function EcosystemMap() {
  return (
    <Card padding="lg" className="flex flex-col gap-8">
      <div>
        <p className="text-near-muted text-xs font-medium tracking-widest uppercase mb-2">+ Ecosystem</p>
        <h2 className="text-near-text font-light leading-none mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
          One Liquidity Layer, Reachable Everywhere
        </h2>
        <p className="text-near-muted text-sm leading-relaxed max-w-lg">
          NEAR Intents connects wallets and apps to liquidity across every major chain.
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-near-subtle uppercase tracking-widest mb-4">
          Top Interfaces
        </p>
        <div className="flex flex-wrap gap-3">
          {ECOSYSTEM_INTERFACES.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <LogoBadge name={item.name} logo={item.logo} className="bg-[#343b3b]" size={64} />
            </a>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-near-subtle uppercase tracking-widest mb-4">
          Supported Chains
        </p>
        <div className="flex flex-wrap gap-3">
          {ECOSYSTEM_CHAINS.map((chain) => (
            <LogoBadge
              key={chain.name}
              name={chain.name}
              logo={chain.logo}
              size={48}
              imgRatio={0.8}
              className="bg-[#262c2c]"
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
