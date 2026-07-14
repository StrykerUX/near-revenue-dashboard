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

4. **Environment variables** — optional. Without them the dashboard renders static
   mock data; set these under Service → **Variables** for live data:

   | Variable | Value |
   |---|---|
   | `NEAR_API_KEY` | Your revenue API key. **Do not commit this** — set it in Railway's Variables UI only. |
   | `NEAR_API_BASE_URL` | Optional override; defaults to the production Railway URL if unset. |
   | `NEXT_PUBLIC_SITE_URL` | Your deployed `*.up.railway.app` domain (or custom domain), for correct Open Graph metadata. |
   | `NEXT_PUBLIC_DEBUG_SOURCES` | Leave unset/`false` in production. |
   | `MAINTENANCE_MODE` | Set to `true` during an incident to show `/maintenance` site-wide (see [ARCHITECTURE.md §11](../ARCHITECTURE.md#11-health-monitoring-maintenance-mode-and-the-tick-worker)). |
   | `DATABASE_URL` | Optional — only needed if you've provisioned the tick-worker's Postgres (below) and want `/health` to show its persisted history. |

   See [ARCHITECTURE.md § Environment variables](../ARCHITECTURE.md#8-environment-variables)
   for what each one does.

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

---

## Optional: persisted health history (`tick-worker/`)

`/health` always works as a live ping with zero extra setup. If you also want a
history of past outages (visible even if nobody had `/health` open at the
time), add two things to the **same Railway project**:

1. **+ New → Database → PostgreSQL.** Railway injects `DATABASE_URL`
   automatically to any service in the project that references it. Add that
   same variable to the dashboard service to unlock the "Persisted history"
   section on `/health`.
2. **+ New → Empty Service**, pointed at this repo's `tick-worker/` directory
   (Settings → Root Directory), with:
   | Setting | Value |
   |---|---|
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Cron Schedule | `*/5 * * * *` (every 5 minutes — matches the dashboard's own fetch-cache window) |
   | Variables | `DATABASE_URL`, `NEAR_API_KEY`, `NEAR_API_BASE_URL` (reference the same values as the dashboard service) |

This service is entirely independent of the dashboard's build and deploy —
skipping it changes nothing about how the site itself runs. See
[ARCHITECTURE.md §11](../ARCHITECTURE.md#11-health-monitoring-maintenance-mode-and-the-tick-worker)
for the full design.
