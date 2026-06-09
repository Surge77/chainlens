# Architecture

ChainLens is a read-only, address-in analytics dashboard. The browser talks only to the
app's own server routes; those routes fan out to chain providers, normalise the responses,
cache them, and return a stable shape. No private keys, no wallet connection.

## High-level flow

```
┌──────────────────────────────────────────────┐
│ Browser (Next.js App Router)                  │
│  Zustand (wallet list) · TanStack Query cache │
└───────────────────────┬───────────────────────┘
                        │ HTTPS (own origin only)
┌───────────────────────▼───────────────────────┐
│ Route Handlers (Node.js runtime)              │
│  /api/wallet/[address]/overview               │
│  /api/wallet/[address]/transactions           │
│  /api/wallet/[address]/chart?period=30d       │
│  /api/prices · /api/health                    │
│  validate → rate limit → cache → fan-out       │
└───────┬─────────────┬──────────────┬───────────┘
        ▼             ▼              ▼
   Alchemy/ETH    Helius/SOL    Blockstream/BTC
        └─────────────┴──────────────┘
                  │ normalised via adapters
            ┌─────▼─────┐
            │  Upstash  │  TTL cache: 60s overview,
            │   Redis   │  300s history, 30s prices
            └───────────┘
```

## Request lifecycle (happy path)

1. User enters an address. A Zod validator confirms the format and **detects the chain**.
2. The frontend calls the relevant route handler.
3. The handler checks the rate limit, then the Redis cache. **Cache hit → return immediately.**
4. **Cache miss →** fan out to the chain provider (+ CoinGecko), normalise via an adapter,
   write to cache, return.
5. TanStack Query stores the response and background-refetches on an interval aligned with
   the cache TTL.

## The adapter pattern

Each chain provider returns a different shape. Adapters in `lib/adapters/{ethereum,solana,bitcoin}.ts`
map those raw responses to the canonical types in `types/index.ts`
(`WalletOverview`, `TokenHolding`, `Transaction`). Components and hooks only ever see the
canonical types — so swapping a provider is a single-file change and never ripples into the UI.

```
raw provider JSON ──▶ adapter ──▶ canonical type ──▶ route envelope ──▶ UI
```

## State management

Two non-overlapping responsibilities:

- **Zustand** owns *which wallets you track* (list, nicknames, max 5) — persisted to
  `localStorage`. This is the only place client state lives.
- **TanStack Query** owns *the current data for a wallet* — the server cache, retries, and
  background refresh.

## Caching & rate limiting

Upstash Redis backs both. Cache keys are derived from the public address and resource type
with short TTLs (overview 60s, history 300s, prices 30s) chosen to balance freshness
against provider quotas. Rate limiting (`@upstash/ratelimit`) protects the routes from
abuse without needing a database.

## Pricing strategy

Reliable USD pricing for arbitrary tokens is hard on free tiers. ChainLens prices the
**native asset plus a curated allowlist** of major tokens, batches and caches CoinGecko
calls, and renders an explicit "—" for tokens it can't price rather than guessing.

## Security

- **No keys in the client.** All provider calls happen server-side; keys come from env vars.
- **Untrusted input.** Addresses are strictly validated server-side before any downstream
  call. Chain data is treated as untrusted and rendered through React's escaped output
  (no `dangerouslySetInnerHTML`).
- **SSRF defence.** Outbound HTTP from route handlers uses an allowlist of known provider
  domains.
- **Privacy.** Addresses key a short-lived cache only; they are truncated in logs
  (`0x1234…abcd`) and never linked to a user or IP in analytics.
- **CSP & headers** are set in `next.config.ts`.

## Runtime choice

Route handlers run on the **Node.js runtime** (Fluid Compute), not Edge — the chain
libraries depend on Node built-ins (`crypto`, `Buffer`) that the Edge runtime does not
fully provide.
