"use client";

import { useEffect, useState } from "react";
import { rpc } from "@/lib/stellar";

const LEDGER_CLOSE_SECONDS = 5; // ~5 s per ledger on Stellar

interface Props {
  expiresAtLedger: number;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "Expired";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ExpiryCountdown({ expiresAtLedger }: Props) {
  const [currentLedger, setCurrentLedger] = useState<number | null>(null);
  const [displaySeconds, setDisplaySeconds] = useState<number | null>(null);

  // Fetch the latest ledger sequence, refresh every 30 s
  useEffect(() => {
    if (expiresAtLedger === 0) return; // no expiry

    async function fetchLedger() {
      try {
        const latest = await rpc.getLatestLedger();
        setCurrentLedger(latest.sequence);
      } catch {
        // silently ignore — stale value is fine
      }
    }

    fetchLedger();
    const interval = setInterval(fetchLedger, 30_000);
    return () => clearInterval(interval);
  }, [expiresAtLedger]);

  // Tick every second to update the countdown display
  useEffect(() => {
    if (currentLedger === null || expiresAtLedger === 0) return;

    const ledgersLeft = expiresAtLedger - currentLedger;
    const initialSeconds = ledgersLeft * LEDGER_CLOSE_SECONDS;
    setDisplaySeconds(Math.max(0, initialSeconds));

    const timer = setInterval(() => {
      setDisplaySeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentLedger, expiresAtLedger]);

  if (expiresAtLedger === 0) {
    return <span className="text-gray-500 text-xs">Never expires</span>;
  }

  if (displaySeconds === null) {
    return <span className="text-gray-500 text-xs">Calculating…</span>;
  }

  const isExpired = displaySeconds <= 0;
  const isUrgent = !isExpired && displaySeconds < 3600; // < 1 hour

  return (
    <span
      className={`text-xs font-mono font-medium ${
        isExpired
          ? "text-red-400"
          : isUrgent
          ? "text-yellow-400"
          : "text-gray-400"
      }`}
      title={`Expires at ledger ${expiresAtLedger}`}
    >
      {isExpired ? "Expired" : `Expires in ${formatDuration(displaySeconds)}`}
    </span>
  );
}
