/**
 * Landing / search page (placeholder).
 *
 * The interactive address search, validation, and dashboard are implemented in a later
 * phase. This is the on-brand entry point so the deployed app reflects ChainLens, not the
 * Next.js starter.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-block rounded-sm border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
        Read-only · Multi-chain
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">ChainLens</h1>
      <p className="mt-4 max-w-xl text-balance text-muted">
        Paste any Ethereum, Solana, or Bitcoin address and see a unified analytics
        dashboard. No wallet connection, no private keys, no custody.
      </p>
      <p className="mt-10 font-mono text-xs text-muted">
        Address search and dashboard — coming in the next build phase.
      </p>
    </main>
  );
}
