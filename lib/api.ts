import { UpstreamError } from "@/lib/http";
import type { ApiError, ApiSuccess } from "@/types";

const CACHE_CONTROL = "s-maxage=60, stale-while-revalidate=30";

/** Best-effort client IP from proxy headers for rate-limit keying. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function jsonSuccess<T>(data: T, cached: boolean): Response {
  const body: ApiSuccess<T> = { data, cached, timestamp: new Date().toISOString() };
  return Response.json(body, {
    status: 200,
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  retryAfter?: number,
): Response {
  const body: ApiError = { error: message, code, ...(retryAfter ? { retryAfter } : {}) };
  return Response.json(body, {
    status,
    headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
  });
}

/** Map a thrown error to the standard error response. */
export function errorResponse(err: unknown): Response {
  if (err instanceof UpstreamError) {
    return jsonError("UPSTREAM_ERROR", "A data provider is temporarily unavailable", 502);
  }
  return jsonError("INTERNAL_ERROR", "Internal error", 500);
}
