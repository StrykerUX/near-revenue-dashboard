import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Toggled via the MAINTENANCE_MODE env var in Railway — no rebuild required,
// just a restart, since it's read at request time and never exposed to the client.
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") return
  return NextResponse.rewrite(new URL("/maintenance", request.url))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images|fonts|maintenance|health|data).*)",
  ],
}
