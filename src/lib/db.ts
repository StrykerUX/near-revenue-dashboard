import { Pool } from "pg"

// Optional Postgres history written by the standalone tick-worker/ service
// (see tick-worker/index.mjs). Entirely opt-in: without DATABASE_URL, every
// export here is a no-op that returns null — /health falls back to showing
// only the live ping, exactly as it did before this file existed.

let pool: Pool | null = null

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  }
  return pool
}

export interface EndpointTick {
  endpointName: string
  path: string
  ok: boolean
  httpStatus: number | null
  latencyMs: number
  isStale: boolean | null
  updatedAt: string | null
  asOf: string | null
  error: string | null
  checkedAt: string
}

// The most recent tick-worker row per endpoint — lets /health show "last
// confirmed write" even for endpoints nobody has live-pinged recently.
// Returns null on any failure (no DATABASE_URL, table missing, connection
// error) so the caller can simply omit the section rather than error out.
export async function fetchTickHistory(): Promise<EndpointTick[] | null> {
  const db = getPool()
  if (!db) return null

  try {
    const { rows } = await db.query(`
      SELECT DISTINCT ON (endpoint_name)
        endpoint_name, path, ok, http_status, latency_ms, is_stale, updated_at, as_of, error, checked_at
      FROM api_ticks
      ORDER BY endpoint_name, checked_at DESC
    `)

    return rows.map((r) => ({
      endpointName: r.endpoint_name,
      path: r.path,
      ok: r.ok,
      httpStatus: r.http_status,
      latencyMs: r.latency_ms,
      isStale: r.is_stale,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      asOf: r.as_of ? new Date(r.as_of).toISOString() : null,
      error: r.error,
      checkedAt: new Date(r.checked_at).toISOString(),
    }))
  } catch {
    return null
  }
}
