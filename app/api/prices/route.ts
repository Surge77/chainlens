import { clientIp, errorResponse, jsonError, jsonSuccess } from "@/lib/api";
import { cached } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";
import { getPrices } from "@/lib/prices";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const ALLOWED_IDS = new Set(["ethereum", "solana", "bitcoin"]);

export async function GET(req: Request) {
  const idsParam = new URL(req.url).searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ALLOWED_IDS.has(s));

  if (ids.length === 0) {
    return jsonError("INVALID_IDS", "Provide one or more of: ethereum, solana, bitcoin", 400);
  }

  const rate = await checkRateLimit(clientIp(req));
  if (!rate.success) {
    return jsonError("RATE_LIMITED", "Too many requests", 429, rate.retryAfter);
  }

  try {
    const { value, hit } = await cached(
      `prices:${ids.sort().join(",")}`,
      CACHE_TTL.prices,
      () => getPrices(ids),
    );
    return jsonSuccess(value, hit);
  } catch (err) {
    return errorResponse(err);
  }
}
