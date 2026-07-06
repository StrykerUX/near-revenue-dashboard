@AGENTS.md

# Working in this repo

Guidance for AI agents and developers contributing to the NEAR Revenue Dashboard.
For a feature/stack overview see [README.md](README.md). For the full data-flow
diagram and API endpoint reference, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Overview

A Next.js 16 (App Router) dashboard rendering NEAR protocol revenue analytics.
It is **API-first with a static fallback**: `src/lib/api.ts` fetches live data from
a revenue API at request time; `src/lib/data.ts` supplies the mock data used only
when the API is unreachable or unconfigured. Never assume a figure is static —
check whether the consuming page fetches from `lib/api.ts` first.

## Architecture

- **App Router**, Server Components by default.
- Client boundaries (`"use client"`) are added **only** where state, effects, or
  browser APIs are required.
- The root layout wraps the tree in `LenisProvider` (a client component) for smooth
  scroll; its server-rendered children stay on the server.

## Directory map

```
src/app/          layout.tsx · page.tsx (/, force-dynamic) · analytics/page.tsx (force-dynamic) ·
                  data/page.tsx (/data, API catalog) · maintenance/page.tsx · globals.css
src/lib/          api.ts (live API client) · data.ts (static fallback) · types.ts · utils.ts (cn, formatters, debugGlow)
src/providers/    lenis-provider.tsx · global-range-provider.tsx (shared 7D/30D/90D/YTD range)
src/components/ui/        card · badge · separator · dropdown · accordion · animated-number
src/components/charts/    gauge · sparkline · area/bar/line/price/stacked/tvl charts
src/components/sections/  header · hero · stats-grid · fees-chart · revenue-charts ·
                          tvl-chart-section · revenue-streams · capture-split ·
                          efficiency-metrics · wallet-table · faq · footer
```

## Conventions

### Server vs Client components
- `"use client"`: everything in `components/charts/*`, `components/ui/animated-number.tsx`,
  `components/ui/dropdown.tsx`, `components/ui/accordion.tsx`, `providers/lenis-provider.tsx`.
- Sections are **server-rendered by default**. The exceptions that hold state and are
  therefore client components: `stats-grid` (selected card), `revenue-charts` (dropdowns),
  `wallet-table` (scroll-trigger), `faq` (open item).
- When in doubt, keep a section on the server and push interactivity into a small child.

### Styling
- Tailwind CSS **v4** — no `tailwind.config.js`. Theme tokens live in `src/app/globals.css`
  under `:root` and are exposed to utilities via the `@theme` block.
- Use NEAR tokens as Tailwind classes: `bg-near-card`, `text-near-green`, `border-near-border`, etc.
- Merge classes with `cn()` from `src/lib/utils.ts`.
- Use **CVA** for component variants — follow the pattern in `components/ui/card.tsx`
  and `components/ui/badge.tsx`.
- Theme is **always dark**; there is no light mode (the `prefers-color-scheme` block was removed).

### Data & API
- `src/lib/api.ts` is a typed `fetch()` client against a live revenue API (base URL +
  `X-API-Key` from `NEAR_API_BASE_URL` / `NEAR_API_KEY`). `page.tsx` and
  `analytics/page.tsx` call its composite fetchers (`fetchDashboardData()`,
  `fetchAnalyticsData()`) inside a `try/catch`, falling back to the static constants
  in `src/lib/data.ts` (typed by `src/lib/types.ts`) if the fetch fails.
- Individual endpoint calls inside `fetchDashboardData()` are wrapped in the `safe()`
  helper (or their own `.catch()`), so one failing endpoint doesn't take down the rest
  of the page — see [ARCHITECTURE.md](ARCHITECTURE.md#2-request--data-flow).
- `StatCard.source?: "api" | "static"` and `debugGlow()` (`src/lib/utils.ts`) mark
  whether a value came from the API or the fallback; the glow only renders when
  `NEXT_PUBLIC_DEBUG_SOURCES=true`.
- Components receive data as props or import the constants directly; do not hardcode
  figures inside components.
- Adding a new metric: add a fetcher + type to `src/lib/api.ts`, a static fallback
  constant to `src/lib/data.ts`, wire it into `fetchDashboardData()` /
  `fetchAnalyticsData()`, then consume it in `page.tsx` / `analytics/page.tsx` with a
  fallback value already in scope before the `try` block.

### Animations
- `AnimatedNumber` (`components/ui/animated-number.tsx`) counts from 0 to the target
  using **GSAP** + an `IntersectionObserver` (fires once when scrolled into view).
  It parses `%`, `M`, and `K` suffixes from the string value.
- `gauge.tsx` animates its SVG arc and the centered percentage with GSAP, also gated by
  an `IntersectionObserver`.
- Recharts charts animate via `isAnimationActive` + `animationDuration` props.
- The wallet table animates its progress bars with a CSS `width` transition triggered by
  an `IntersectionObserver`.

### Charts (Recharts)
- All chart components are `"use client"`.
- Y-axis ticks are **fixed arrays** to match the reference design (e.g. `[0, 6.3M, 12.5M, 18.8M, 25M]`)
  combined with an explicit `domain` — do not rely on auto-ticks.
- X-axis labels for the year-long series use the `getBimonthlyTicks` helper
  (May / Jul / Sep / Nov / Jan / Mar / May).

## Common tasks

| Goal | Where |
|------|-------|
| Change a *fallback* hero number / capture rate / 30d change | constants at the bottom of `src/lib/data.ts` |
| Edit a stat card fallback | `STATS` array in `data.ts` |
| Add / edit an FAQ | `FAQ_ITEMS` array in `data.ts` (first item is open by default via `defaultOpenId="01"`) |
| Reshape a chart's fallback data | the series builders / arrays in `data.ts` (`TOTAL_FEES_SERIES`, `REVENUE_MONTHLY`, `EMISSIONS_SERIES`) |
| Add a new live metric | `src/lib/api.ts` (fetcher + type) → wire into `fetchDashboardData()`/`fetchAnalyticsData()` → consume in `page.tsx`/`analytics/page.tsx` |
| Document a new API endpoint for humans | `GROUPS` catalog in `src/app/data/page.tsx` |
| Adjust a color | the `--near-*` tokens in `src/app/globals.css` |

## Gotchas

- **Recharts 2.x** prints a deprecation warning on install — expected and safe (v3 has a
  rewritten API we intentionally avoid).
- `pnpm install` reports ignored build scripts (`sharp`, `unrs-resolver`). This is harmless
  for development; `npm install` runs without the prompt. See the deploy guides for the
  production implication of `sharp`.
- Next.js 16 differs from older releases — per `AGENTS.md`, consult
  `node_modules/next/dist/docs/` before changing framework-level code.
- Always verify with `pnpm build` — TypeScript runs in **strict** mode.

## Commands

```bash
pnpm dev      # develop at http://localhost:3000
pnpm build    # production build + type check
pnpm start    # serve the production build
pnpm lint     # ESLint
```
