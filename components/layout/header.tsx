import Link from "next/link";

/** Top bar with the wordmark, linking home. */
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight">
            Arg<span className="text-accent">us</span>
          </span>
        </Link>
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Read-only
        </span>
      </div>
    </header>
  );
}
