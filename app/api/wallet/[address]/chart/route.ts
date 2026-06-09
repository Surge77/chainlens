import { clientIp, errorResponse, jsonError, jsonSuccess } from "@/lib/api";
import { cached } from "@/lib/cache";
import { CACHE_TTL, NATIVE_ASSET, PERIOD_DAYS } from "@/lib/constants";
import { log } from "@/lib/logger";
import { getMarketChart } from "@/lib/prices";
import { checkRateLimit } from "@/lib/ratelimit";
import { parseAddress } from "@/lib/validators/address";
import type { ChartPeriod } from "@/types";

export const runtime = "nodejs";

function parsePeriod(value: string | null): ChartPeriod {
  return value && value in PERIOD_DAYS ? (value as ChartPeriod) : "30d";
}

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
  const period = parsePeriod(new URL(req.url).searchParams.get("period"));

  const rate = await checkRateLimit(clientIp(req));
  if (!rate.success) {
    return jsonError("RATE_LIMITED", "Too many requests", 429, rate.retryAfter);
  }

  const start = Date.now();
  try {
    const { coingeckoId } = NATIVE_ASSET[chain];
    const { value, hit } = await cached(
      `chart:${chain}:${period}`,
      CACHE_TTL.chart,
      () => getMarketChart(coingeckoId, PERIOD_DAYS[period]),
    );
    log("info", {
      message: "wallet_chart_fetched",
      address,
      chain,
      cache_hit: hit,
      duration_ms: Date.now() - start,
    });
    return jsonSuccess({ period, points: value }, hit);
  } catch (err) {
    log("error", { message: "wallet_chart_failed", address, chain, error: String(err) });
    return errorResponse(err);
  }
}
