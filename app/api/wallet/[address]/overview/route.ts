import { fetchOverview } from "@/lib/adapters";
import { clientIp, errorResponse, jsonError, jsonSuccess } from "@/lib/api";
import { cached } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";
import { log } from "@/lib/logger";
import { checkRateLimit } from "@/lib/ratelimit";
import { parseAddress } from "@/lib/validators/address";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ address: string }> },
) {
  const { address: raw } = await ctx.params;
  const parsed = parseAddress(raw);
  if (!parsed) {
    return jsonError("INVALID_ADDRESS", "Not a valid wallet address", 400);
  }
  const { address, chain } = parsed;

  const rate = await checkRateLimit(clientIp(req));
  if (!rate.success) {
    return jsonError("RATE_LIMITED", "Too many requests", 429, rate.retryAfter);
  }

  const start = Date.now();
  try {
    const { value, hit } = await cached(`overview:${chain}:${address}`, CACHE_TTL.overview, () =>
      fetchOverview(chain, address),
    );
    log("info", {
      message: "wallet_overview_fetched",
      address,
      chain,
      cache_hit: hit,
      duration_ms: Date.now() - start,
    });
    return jsonSuccess(value, hit);
  } catch (err) {
    log("error", { message: "wallet_overview_failed", address, chain, error: String(err) });
    return errorResponse(err);
  }
}
