"use client";

import { Wallet, LogOut, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

function truncate(addr: string) {
  return `${addr.slice(0, 5)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, connecting, error, connect, disconnect } = useWallet();

  if (connecting) {
    return (
      <button disabled className="btn-secondary opacity-60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting…
      </button>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:block rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-mono text-gray-300">
          {truncate(address)}
        </span>
        <button
          onClick={disconnect}
          aria-label="Disconnect wallet"
          className="btn-secondary !px-2 !py-2"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={connect} className="btn-primary">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
      {error && (
        <p className="text-xs text-red-400 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
