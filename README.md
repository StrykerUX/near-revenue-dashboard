# NEAR Revenue Dashboard

Internal revenue analytics dashboard for the NEAR Foundation — a single-page, dark-themed view of protocol and product revenue, fee capture, and on-chain wallet distribution.

> All figures shown are **illustrative mock data**. See [Data layer](#data-layer).

---

## Features

- **Header** — NEAR branding and a live "last updated" indicator.
- **Hero** — Animated headline metric (total fees generated), a custom SVG **capture-rate gauge**, and a 30-day fees **sparkline**.
- **Stats grid** — Three selectable revenue cards (all-time / YTD / 30D) with a highlighted active state.
- **Total fees chart** — Full-width cumulative area chart over the trailing year.
- **Revenue charts** — Side-by-side monthly revenue **bar chart** and revenue-vs-emissions **line chart**, each with a dropdown control.
- **Wallet table** — On-chain revenue distribution with scroll-triggered progress bars.
- **FAQ** — Accessible accordion (single-open).
- **Footer** — Data-source attribution and NEAR wordmark.
- **Motion** — Scroll-triggered counter animations (GSAP) and Lenis smooth scrolling throughout.

---

## Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.2.7 |
| UI runtime | React | 19.2.4 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 (`@theme`, no config file) | 4.x |
| Charts | [Recharts](https://recharts.org) | 2.15.4 |
| Animation | [GSAP](https://gsap.com) | 3.x |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) | 1.3.x |
| Component utils | class-variance-authority · clsx · tailwind-merge | — |
| Icons | [lucide-react](https://lucide.dev) | 0.511 |
| Package manager | pnpm | 11.5.1 |

> **Note:** This project does **not** use shadcn/ui. UI primitives are built directly with CVA + `clsx` + `tailwind-merge`.

---

## Prerequisites

- **Node.js** 20 or newer
- **pnpm** 11+ (pinned via the `packageManager` field; `npm` also works)

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: Geist fonts + LenisProvider
│   ├── page.tsx            # Composes all dashboard sections
│   └── globals.css         # Tailwind v4 import + NEAR theme tokens
├── lib/
│   ├── data.ts             # Mock data — single source of truth
│   ├── types.ts            # TimeSeriesPoint, WalletRow, FaqItem, StatCard
│   └── utils.ts            # cn() class-merge helper
├── providers/
│   └── lenis-provider.tsx  # Smooth-scroll context ("use client")
└── components/
    ├── ui/                 # card, badge, separator, dropdown, accordion, animated-number
    ├── charts/             # gauge, sparkline, area-chart, bar-chart, line-chart
    └── sections/           # header, hero, stats-grid, fees-chart,
                            #   revenue-charts, wallet-table, faq, footer
```

---

## Design system

Always-dark theme. Colors are defined as CSS custom properties in `src/app/globals.css` and exposed to Tailwind via `@theme` (e.g. `bg-near-card`, `text-near-green`).

| Token | Value | Usage |
|-------|-------|-------|
| `--near-bg` | `#0b0d0d` | Page background |
| `--near-card` | `#111414` | Card surface |
| `--near-card-hover` | `#161919` | Card hover surface |
| `--near-border` | `#1f2424` | Borders / grid lines |
| `--near-green` | `#00ec97` | Primary accent / positive |
| `--near-green-dim` | `#00c880` | Secondary green |
| `--near-green-muted` | `rgba(0,236,151,0.12)` | Green fills / glows |
| `--near-red` | `#ff5f57` | Negative / alerts |
| `--near-red-muted` | `rgba(255,95,87,0.15)` | Red fills |
| `--near-text` | `#ffffff` | Primary text |
| `--near-muted` | `#b4b9b9` | Secondary text |
| `--near-subtle` | `#6b7070` | Tertiary text / axis labels |

**Fonts:** Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`), loaded via `next/font`.

---

## Data layer

There is no backend. Every number, series, and table row is static mock data exported from **`src/lib/data.ts`**, typed by `src/lib/types.ts`:

- `TOTAL_FEES_SERIES` — cumulative fees (hockey-stick curve), 53 weekly points.
- `REVENUE_MONTHLY` — 13 monthly revenue bars.
- `EMISSIONS_SERIES` — revenue-as-%-of-emissions, 53 weekly points.
- `SPARKLINE_DATA` — 30-day fees mini-trend.
- `WALLET_ROWS`, `STATS`, `FAQ_ITEMS` — table, cards, and FAQ content.
- Headline constants: `GAUGE_VALUE`, `FEES_LAST_30D`, `TOTAL_FEES_DISPLAY`, `FEES_CHANGE`.

To change any displayed figure, edit `src/lib/data.ts` — no component changes needed.

---

## Deployment

Two step-by-step guides are provided:

- **[Deploy to Vercel](docs/deploy-vercel.md)** — recommended, zero-config.
- **[Deploy to Railway](docs/deploy-railway.md)** — container-based self-hosting.

No environment variables are required for either target.

---

## License

Internal project — not licensed for public distribution.
