import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Chain } from "@/types";

export const MAX_WALLETS = 5;

export interface TrackedWallet {
  address: string;
  chain: Chain;
  label?: string;
}

interface WalletState {
  wallets: TrackedWallet[];
  addWallet: (wallet: TrackedWallet) => void;
  removeWallet: (address: string) => void;
  renameWallet: (address: string, label: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      wallets: [],
      addWallet: (wallet) =>
        set((state) => {
          if (
            state.wallets.some((w) => w.address === wallet.address) ||
            state.wallets.length >= MAX_WALLETS
          ) {
            return state;
          }
          return { wallets: [...state.wallets, wallet] };
        }),
      removeWallet: (address) =>
        set((state) => ({ wallets: state.wallets.filter((w) => w.address !== address) })),
      renameWallet: (address, label) =>
        set((state) => ({
          wallets: state.wallets.map((w) => (w.address === address ? { ...w, label } : w)),
        })),
    }),
    { name: "argus:wallets" },
  ),
);
