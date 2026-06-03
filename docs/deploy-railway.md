# Deploy to Railway

[Railway](https://railway.app) is a container-based PaaS. It builds the app with
Nixpacks, runs it as a long-lived Node process, and auto-deploys on every push — a good
option for self-hosted Next.js.

---

## Prerequisites

- A [Railway](https://railway.app) account.
- The repository on GitHub (`StrykerUX/near-revenue-dashboard`).

---

## Steps

1. **Create the project**
   - Railway Dashboard → **New Project → Deploy from GitHub repo**.
   - Authorize GitHub if prompted and select the repository.

2. **Build detection**
   - Nixpacks detects **pnpm** from the `packageManager` field and installs dependencies
     with `pnpm install`.

3. **Set the commands** (Service → **Settings**):
   | Setting | Value |
   |---------|-------|
   | Build Command | `pnpm build` |
   | Start Command | `pnpm start` |

   `next start` automatically binds to the `PORT` environment variable that Railway
   injects — no extra flags or config needed.

4. **Environment variables** — none required (static mock data).

5. **Deploy** — Railway builds and starts the service, then exposes it on a generated
   `*.up.railway.app` domain (Service → **Settings → Networking → Generate Domain**).

---

## Continuous deployment

Pushes to **`main`** automatically rebuild and redeploy the service.

---

## Gotcha: native build scripts (`sharp`)

`pnpm-workspace.yaml` lists `sharp` under `ignoredBuiltDependencies`, so its native
binary is **not** compiled during install.

- This dashboard uses **inline SVG** logos only and does **not** use `next/image` for
  raster images, so it deploys and runs correctly as-is.
- If raster `next/image` optimization is added later, `sharp` must compile in the build
  environment. Either move it out of `ignoredBuiltDependencies` into
  `onlyBuiltDependencies` in `pnpm-workspace.yaml`, or approve the build for the Railway
  environment. Without it, image optimization will fail at runtime in production.

---

## Health & port

- Do **not** hardcode a port — rely on Railway's injected `PORT` (handled by `next start`).
- Confirm the service is reachable on its generated domain after the first deploy.
