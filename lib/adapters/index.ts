import {
  fetchBitcoinOverview,
  fetchBitcoinTransactions,
} from "@/lib/adapters/bitcoin";
import {
  fetchEthereumOverview,
  fetchEthereumTransactions,
} from "@/lib/adapters/ethereum";
import {
  fetchSolanaOverview,
  fetchSolanaTransactions,
} from "@/lib/adapters/solana";
import type { Chain, Transaction, WalletOverview } from "@/types";

/** Dispatch an overview fetch to the adapter for the detected chain. */
export function fetchOverview(chain: Chain, address: string): Promise<WalletOverview> {
  switch (chain) {
    case "ethereum":
      return fetchEthereumOverview(address);
    case "solana":
      return fetchSolanaOverview(address);
    case "bitcoin":
      return fetchBitcoinOverview(address);
  }
}

/** Dispatch a transactions fetch to the adapter for the detected chain. */
export function fetchTransactions(chain: Chain, address: string): Promise<Transaction[]> {
  switch (chain) {
    case "ethereum":
      return fetchEthereumTransactions(address);
    case "solana":
      return fetchSolanaTransactions(address);
    case "bitcoin":
      return fetchBitcoinTransactions(address);
  }
}
