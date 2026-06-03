import { Gauge } from "@/components/charts/gauge"
import { Sparkline } from "@/components/charts/sparkline"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { GAUGE_VALUE, FEES_LAST_30D, TOTAL_FEES_DISPLAY, FEES_CHANGE, SPARKLINE_DATA } from "@/lib/data"

export function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Left: headline + big number */}
      <div className="lg:col-span-3 flex flex-col justify-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-near-muted text-xs font-medium tracking-widest uppercase">+ Total fees generated</span>
        </div>

        <div>
          <p className="text-near-muted text-base leading-snug mb-3">
            NEAR is earning{" "}
            <em className="not-italic text-near-green font-medium">revenue</em>, in real time.
          </p>
          <div className="flex items-baseline gap-4 flex-wrap">
            <AnimatedNumber
              value={TOTAL_FEES_DISPLAY}
              duration={2}
              className="text-near-text font-bold leading-none"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            />
            <span
              className="text-near-green font-bold leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              NEAR
            </span>
          </div>
        </div>

        <p className="text-near-muted text-sm leading-relaxed max-w-lg">
          Gross fees generated across NEAR Protocol and NEAR Intents, all-time — the economic activity
          NEAR settles from every swap routed through NEAR Intents.
        </p>

        <div>
          <Badge variant="red">
            <span>▼ <AnimatedNumber value={FEES_CHANGE} duration={1.2} />%</span>
            <span className="text-near-red/60">·</span>
            <span>rev 30d</span>
          </Badge>
        </div>
      </div>

      {/* Right: capture rate card */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-near-border bg-near-card p-6 flex flex-col gap-4">
          <Gauge value={GAUGE_VALUE} />

          <p className="text-xs text-near-muted text-center leading-relaxed">
            Share of total fees captured as protocol revenue.
          </p>

          <Separator />

          <div>
            <p className="text-xs text-near-subtle mb-2">Fees · last 30 days</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={FEES_LAST_30D}
                  duration={1.5}
                  delay={0.3}
                  className="text-2xl font-bold text-near-text"
                />
                <span className="text-sm text-near-muted font-medium">NEAR</span>
              </div>
              <div className="flex-1 min-w-0 max-w-[140px]">
                <Sparkline data={SPARKLINE_DATA} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
