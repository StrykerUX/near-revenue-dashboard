@AGENTS.md

# Working in this repo

Guidance for AI agents and developers contributing to the NEAR Revenue Dashboard.
For a feature/stack overview see [README.md](README.md).

## Overview

A single-page Next.js 16 (App Router) dashboard rendering NEAR protocol revenue
analytics from **static mock data**. There is no backend, database, or API — every
figure comes from `src/lib/data.ts`.

## Architecture

- **App Router**, Server Components by default.
- Client boundaries (`"use client"`) are added **only** where state, effects, or
  browser APIs are required.
- The root layout wraps the tree in `LenisProvider` (a client component) for smooth
  scroll; its server-rendered children stay on the server.

## Directory map

```
src/app/          layout.tsx · page.tsx · globals.css
src/lib/          data.ts (mock data) · types.ts · utils.ts (cn)
src/providers/    lenis-provider.tsx
src/components/ui/        card · badge · separator · dropdown · accordion · animated-number
src/components/charts/    gauge · sparkline · area-chart · bar-chart · line-chart
src/components/sections/  header · hero · stats-grid · fees-chart · revenue-charts ·
                          wallet-table · faq · footer
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

### Data
- `src/lib/data.ts` is the **single source of truth**, typed by `src/lib/types.ts`.
- Components receive data as props or import the constants directly; do not hardcode
  figures inside components.

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
| Change the hero number / capture rate / 30d change | constants at the bottom of `src/lib/data.ts` |
| Edit a stat card | `STATS` array in `data.ts` |
| Add / edit an FAQ | `FAQ_ITEMS` array in `data.ts` (first item is open by default via `defaultOpenId="01"`) |
| Reshape a chart's data | the series builders / arrays in `data.ts` (`TOTAL_FEES_SERIES`, `REVENUE_MONTHLY`, `EMISSIONS_SERIES`) |
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
