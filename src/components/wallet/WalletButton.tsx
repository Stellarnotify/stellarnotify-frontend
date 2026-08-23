"use client";

import { Wallet, LogOut, Loader2, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const FREIGHTER_INSTALL_URL =
  "https://www.freighter.app/";

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

  // Freighter not installed — show install link
  if (error === "FREIGHTER_NOT_INSTALLED") {
    return (
      <div className="flex flex-col items-end gap-1">
        <a
          href={FREIGHTER_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs"
          aria-label="Install Freighter wallet extension"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Install Freighter
        </a>
        <p className="text-xs text-gray-500 max-w-[180px] text-right">
          Freighter browser extension required
        </p>
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
