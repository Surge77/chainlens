import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/components/wallet/dashboard";
import { DashboardLive } from "@/components/wallet/dashboard-live";
import { fetchOverview } from "@/lib/adapters";
import { truncateAddress } from "@/lib/utils";
import { parseAddress } from "@/lib/validators/address";

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const parsed = parseAddress(address);
  if (!parsed) return { title: "Wallet not found — Argus" };
  const short = truncateAddress(parsed.address);
  return {
    title: `${short} — Argus`,
    description: `Read-only ${parsed.chain} analytics for ${short}.`,
    openGraph: {
      title: `${short} — Argus`,
      description: `Read-only ${parsed.chain} wallet analytics.`,
    },
  };
}

/**
 * Shareable wallet dashboard (SSR). The overview is fetched server-side for a crawlable,
 * spinner-free first paint; transactions and chart hydrate as client islands. If the
 * server fetch fails, a client fallback retries.
 */
export default async function WalletPage({ params }: PageProps) {
  const { address: raw } = await params;
  const parsed = parseAddress(raw);
  if (!parsed) notFound();

  let prefetched = null;
  try {
    prefetched = await fetchOverview(parsed.chain, parsed.address);
  } catch {
    prefetched = null;
  }

  return (
    <AppShell>
      {prefetched ? (
        <Dashboard overview={prefetched} />
      ) : (
        <DashboardLive address={parsed.address} />
      )}
    </AppShell>
  );
}
