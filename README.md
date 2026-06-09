<div align="center">

# ChainLens

**Multi-chain wallet analytics — paste an address, see everything.**

Read-only portfolio, token, and transaction analytics across **Ethereum**, **Solana**,
and **Bitcoin**. No wallet connection, no private keys, no custody.

[Features](#features) · [Tech stack](#tech-stack) · [Getting started](#getting-started) · [Architecture](docs/architecture.md) · [API](docs/api.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## Why

Crypto holders who span multiple chains have no single place to see their full financial
picture without connecting a wallet — which carries real risk. ChainLens is **read-only
and address-based**: you paste a public address, it auto-detects the chain, and renders a
unified dashboard. Nothing is signed, nothing is stored about you.

## Features

- **Paste any address** — Ethereum (`0x…`), Solana (base58), or Bitcoin (legacy / bech32).
- **Auto chain detection** from the address format.
- **Native balance + USD** for ETH / SOL / BTC.
- **Top token holdings** with price and 24h change (curated pricing allowlist).
- **Recent transactions** — hash, type, value, fee, timestamp, status.
- **Price sparkline** over 7d / 30d / 90d / 1y.
- **Track up to 5 wallets** with client-side nicknames and a switcher sidebar.
- **Chain filter** and **shareable URLs** (server-rendered for link previews).

> Roadmap (post-MVP): NFT gallery, DeFi positions, gas analytics, CSV export, balance
> alerts, true historical portfolio reconstruction, ENS/SNS, and BRC-20.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, RSC) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, dark-first |
| Data (server) | Route Handlers (Node runtime) |
| Chain data | Alchemy (ETH), Helius (SOL), Blockstream (BTC) — each with a fallback |
| Prices | CoinGecko |
| Cache / rate limit | Upstash Redis + `@upstash/ratelimit` |
| Client state | Zustand (wallets) + TanStack Query (server cache) |
| Validation | Zod |
| Charts | Recharts |
| Tests | Vitest (unit/integration), Playwright (E2E) |

## Getting started

**Prerequisites:** Node.js 20+ and [pnpm](https://pnpm.io) 10+.

```bash
git clone https://github.com/Surge77/chainlens.git
cd chainlens
pnpm install
cp .env.example .env.local   # then fill in your API keys
pnpm dev                     # http://localhost:3000
```

All chain API keys are server-side only — they are never exposed to the browser. The app
runs with graceful degradation if a provider key is missing or a provider is down.

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Lint with ESLint |
| `pnpm test` | Run unit + integration tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |

### Environment variables

See [`.env.example`](.env.example) for the full list. Required keys are validated at
startup; missing required keys fail fast with a clear message.

## Documentation

- **[Architecture](docs/architecture.md)** — data flow, the adapter pattern, caching.
- **[API reference](docs/api.md)** — route handlers and response envelopes.
- **[Contributing](CONTRIBUTING.md)** — setup, conventions, and PR process.

## Security & privacy

ChainLens never asks you to connect a wallet or sign anything. It only reads public
on-chain data for the address you enter. Addresses are used to key a short-lived cache and
are never linked to you in logs or analytics. See
[Architecture › Security](docs/architecture.md#security) for details.

## License

[MIT](LICENSE) © ChainLens contributors
