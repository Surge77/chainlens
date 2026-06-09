import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every route.
 *
 * A strict Content-Security-Policy is intentionally deferred to the hardening phase:
 * doing it correctly with the App Router requires nonce-based middleware, and a misconfigured
 * CSP silently breaks hydration. The headers below are safe to ship today.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
