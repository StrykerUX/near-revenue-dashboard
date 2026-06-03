# Deploy to Vercel

Vercel is the first-party platform for Next.js and the recommended target for this
project — it requires **zero configuration**.

---

## Prerequisites

- A [Vercel](https://vercel.com) account.
- The repository on GitHub (already at `StrykerUX/near-revenue-dashboard`).

---

## Steps

1. **Import the repository**
   - Vercel Dashboard → **Add New… → Project**.
   - Select the GitHub repo and click **Import**.

2. **Confirm the auto-detected settings** — no changes needed:
   | Setting | Value (auto-detected) |
   |---------|------------------------|
   | Framework Preset | Next.js |
   | Install Command | `pnpm install` (from the pinned `packageManager`) |
   | Build Command | `next build` |
   | Output Directory | `.next` |

3. **Environment variables** — none. The dashboard renders entirely from static mock
   data (`src/lib/data.ts`), so leave this section empty.

4. **Deploy** — click **Deploy**. The first build takes ~1–2 minutes.

---

## Node & package manager

- Vercel reads the `packageManager` field and uses **pnpm** automatically.
- Default runtime is a current LTS (Node 20+), which satisfies this project.
- To pin a specific Node major, set it in **Project → Settings → Build & Development →
  Node.js Version**, or add an `engines` field to `package.json`.

---

## Continuous deployment

- Every push to **`main`** triggers a **production** deployment.
- Every pull request / branch gets its own **preview** URL.

---

## Custom domain

Project → **Settings → Domains** → add your domain and follow the DNS instructions.

---

## Notes

- `.vercel` is already in `.gitignore`.
- The `sharp` build-script warning you see locally with pnpm is **irrelevant on Vercel** —
  the platform provides an optimized `sharp` for `next/image` automatically.
