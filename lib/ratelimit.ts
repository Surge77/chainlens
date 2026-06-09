import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { RATE_LIMIT } from "@/lib/constants";
import { env } from "@/lib/env";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url: env.upstashUrl, token: env.upstashToken }),
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT.requests,
        `${RATE_LIMIT.windowSeconds} s`,
      ),
      prefix: "argus:rl",
    });
  }
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  retryAfter: number;
}

/**
 * Check the per-IP rate limit. Fails open (allows the request) if the limiter backend is
 * unreachable, so a Redis outage degrades to "no limiting" rather than a hard 500.
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    const { success, reset } = await getLimiter().limit(identifier);
    return { success, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
  } catch {
    return { success: true, retryAfter: 0 };
  }
}
