// Standalone health-tick worker for the NEAR Revenue API.
//
// Deployed as its OWN Railway service (Cron Job), separate from the dashboard.
// Deliberately has no import from the dashboard's src/ — plain Node + `pg` only —
// so it can never affect the dashboard's build or runtime. A single run: ping
// every endpoint the dashboard depends on, write one row per endpoint to
// Postgres, exit.

import pg from "pg"

const BASE_URL = process.env.NEAR_API_BASE_URL ?? "https://revenue-dashboard-api-production.up.railway.app"
const API_KEY = process.env.NEAR_API_KEY ?? ""
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set — cannot log a tick. Exiting.")
  process.exit(1)
}

// Same 12 endpoints as fetchHealthReport() in src/lib/api.ts. Duplicated here
// on purpose — this worker must not depend on the dashboard's codebase.
function buildEndpoints() {
  const today = new Date().toISOString().slice(0, 10)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return [
    { name: "Snapshot", path: "/v1/snapshot", params: { denomination: "usd" } },
    { name: "Revenue series", path: "/v1/series/revenue", params: { from: "2025-01-01", to: today, grain: "month" } },
    { name: "Wallet breakdown", path: "/v1/wallets/breakdown" },
    { name: "Buyback", path: "/v1/wallets/buyback" },
    { name: "Emissions series", path: "/v1/series/emissions", params: { from: "2025-01-01", to: today } },
    { name: "Total fees series", path: "/v1/series/total-fees", params: { from: "2025-01-01", to: today, grain: "day" } },
    { name: "Intent volume series", path: "/v1/series/intent-volume", params: { from: "2025-01-01", to: today, grain: "day" } },
    { name: "Unique users", path: "/v1/metrics/unique-users" },
    { name: "Price series", path: "/v1/series/price", params: { from: ninetyDaysAgo, to: today, grain: "day" } },
    { name: "Confidential TVL", path: "/v1/series/confidential-tvl", params: { from: "2026-01-01", to: today, grain: "day" } },
    { name: "Revenue by stream", path: "/v1/metrics/revenue-by-stream" },
    { name: "Capture split", path: "/v1/metrics/capture-split" },
  ]
}

async function checkEndpoint(name, path, params) {
  const url = new URL(path, BASE_URL)
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  const start = Date.now()

  try {
    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": API_KEY },
      signal: controller.signal,
    })
    const latencyMs = Date.now() - start

    if (!res.ok) {
      return { name, path, ok: false, httpStatus: res.status, latencyMs, isStale: null, updatedAt: null, asOf: null, error: `HTTP ${res.status}` }
    }

    const body = await res.json()
    return {
      name,
      path,
      ok: true,
      httpStatus: res.status,
      latencyMs,
      isStale: typeof body.is_stale === "boolean" ? body.is_stale : null,
      updatedAt: body.updated_at ?? null,
      asOf: body.as_of ?? null,
      error: null,
    }
  } catch (err) {
    return {
      name,
      path,
      ok: false,
      httpStatus: null,
      latencyMs: Date.now() - start,
      isStale: null,
      updatedAt: null,
      asOf: null,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_ticks (
      id bigserial PRIMARY KEY,
      checked_at timestamptz NOT NULL DEFAULT now(),
      endpoint_name text NOT NULL,
      path text NOT NULL,
      ok boolean NOT NULL,
      http_status integer,
      latency_ms integer NOT NULL,
      is_stale boolean,
      updated_at timestamptz,
      as_of timestamptz,
      error text
    );
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_api_ticks_endpoint_checked_at
    ON api_ticks (endpoint_name, checked_at DESC);
  `)
}

async function insertTick(pool, result) {
  await pool.query(
    `INSERT INTO api_ticks
      (endpoint_name, path, ok, http_status, latency_ms, is_stale, updated_at, as_of, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      result.name,
      result.path,
      result.ok,
      result.httpStatus,
      result.latencyMs,
      result.isStale,
      result.updatedAt,
      result.asOf,
      result.error,
    ]
  )
}

async function main() {
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  })

  try {
    await ensureTable(pool)

    const endpoints = buildEndpoints()
    const results = await Promise.all(endpoints.map((e) => checkEndpoint(e.name, e.path, e.params)))

    for (const result of results) {
      await insertTick(pool, result)
    }

    const okCount = results.filter((r) => r.ok).length
    console.log(`Tick complete: ${okCount}/${results.length} endpoints ok.`)
  } finally {
    await pool.end()
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Tick worker failed:", err)
    process.exit(1)
  })
