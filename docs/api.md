# API reference

All endpoints are app-internal Next.js Route Handlers. They are read-only, rate-limited,
and cached. Responses use a consistent envelope.

## Response envelope

**Success**

```json
{ "data": { }, "cached": false, "timestamp": "2026-06-09T10:00:00.000Z" }
```

**Error**

```json
{ "error": "human-readable message", "code": "SCREAMING_SNAKE_CODE", "retryAfter": 30 }
```

`retryAfter` (seconds) is present only on rate-limit (`429`) responses.

### Status codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Invalid address / params |
| 404 | Address not found on chain |
| 429 | Rate limited (`retryAfter` set) |
| 502 | Upstream provider failed (after fallback) |

---

## `GET /api/wallet/{address}/overview`

Native balance, USD value, token holdings, and last activity for an address. Chain is
auto-detected from the address format.

**`data`** → [`WalletOverview`](#walletoverview)

---

## `GET /api/wallet/{address}/transactions`

Most recent transactions, 25 per page, newest first.

| Query | Type | Default | Notes |
|-------|------|---------|-------|
| `cursor` | string | — | Opaque pagination cursor from the previous page |

**`data`** → `{ transactions: Transaction[], nextCursor: string \| null }`

---

## `GET /api/wallet/{address}/chart`

Native-asset price series for the address's chain over a period.

| Query | Type | Default | Allowed |
|-------|------|---------|---------|
| `period` | string | `30d` | `7d`, `30d`, `90d`, `1y` |

**`data`** → `{ period: string, points: { t: string, usd: number }[] }`

---

## `GET /api/prices`

Spot USD prices for one or more native assets.

| Query | Type | Notes |
|-------|------|-------|
| `ids` | string | Comma-separated, e.g. `ethereum,solana,bitcoin` |

**`data`** → `{ [id: string]: { usd: number, change24h: number } }`

---

## `GET /api/health`

Liveness probe for external monitors. Not rate-limited.

```json
{ "status": "ok", "chains": ["ethereum", "solana", "bitcoin"] }
```

---

## Canonical types

### `WalletOverview`

```typescript
interface WalletOverview {
  address: string
  chain: 'ethereum' | 'solana' | 'bitcoin'
  nativeBalance: { raw: string; formatted: string; usdValue: number | null }
  tokens: TokenHolding[]
  lastActivity: string | null // ISO 8601
}
```

### `TokenHolding`

```typescript
interface TokenHolding {
  symbol: string
  name: string
  logoUrl: string | null
  balance: string
  usdValue: number | null       // null when the token isn't on the pricing allowlist
  priceChange24h: number | null
  contractAddress: string | null
}
```

### `Transaction`

```typescript
interface Transaction {
  hash: string
  chain: 'ethereum' | 'solana' | 'bitcoin'
  type: 'send' | 'receive' | 'swap' | 'contract_interaction' | 'unknown'
  value: string
  usdValue: number | null
  fee: string
  timestamp: string             // ISO 8601
  status: 'confirmed' | 'pending' | 'failed'
  counterparty: string | null
}
```
