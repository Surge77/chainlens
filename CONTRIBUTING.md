# Contributing to Argus

Thanks for your interest in improving Argus. This guide covers local setup,
conventions, and the pull-request process.

## Local setup

**Prerequisites:** Node.js 20+ and pnpm 10+.

```bash
pnpm install
cp .env.example .env.local   # fill in API keys (see below)
pnpm dev
```

You can develop most of the app without paid keys — Bitcoin uses keyless public APIs, and
missing providers degrade gracefully. Add Alchemy / Helius keys when working on the
Ethereum / Solana paths.

## Project conventions

- **TypeScript strict.** No `any`; use `unknown` and narrow, or define a proper type.
- **Validate at boundaries.** Every external/route input is parsed with a Zod schema.
- **Server Components by default.** Add `'use client'` only for state, effects, or browser APIs.
- **No secrets client-side.** All chain calls go through server route handlers.
- **Adapters isolate vendors.** Map raw API responses to the canonical types in `types/`
  inside `lib/adapters/` — never leak vendor shapes into components.
- **Styling:** Tailwind utilities only, dark-first. No inline styles except dynamic values.
- **Files stay small** and single-responsibility.

## Testing

```bash
pnpm test         # Vitest unit + integration
pnpm test:e2e     # Playwright end-to-end
```

- Add unit tests for validators, adapters, utilities, and store logic.
- Add an integration test (happy path + at least one error path) for new route handlers.
- Keep tests isolated — no shared mutable state, no real network calls (mock at the I/O boundary).

## Commits & branches

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(wallet): add SPL token table
fix(api): return 404 when address is invalid
chore(deps): pin upstash redis
```

- Branch names: `feat/<short-desc>`, `fix/<short-desc>`.
- One logical change per commit. Run lint + tests before pushing.

## Pull requests

1. Fork and branch from `main`.
2. Make your change with tests and passing lint/type checks.
3. Open a PR using the template; describe the change and how you verified it.
4. CI must be green before review.

## Reporting issues

Use the issue templates for bugs and feature requests. For anything security-sensitive,
please do not open a public issue — see the security note in the README.
