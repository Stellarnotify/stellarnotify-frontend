"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check } from "lucide-react";

interface Props {
  onRenew: (additionalLedgers: number) => Promise<void>;
  disabled?: boolean;
}

const PRESETS = [
  { label: "~1 day", ledgers: 17_280 },
  { label: "~7 days", ledgers: 120_960 },
  { label: "~30 days", ledgers: 518_400 },
];

export function RenewButton({ onRenew, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRenew = async (ledgers: number) => {
    if (ledgers <= 0 || loading) return;
    setLoading(true);
    try {
      await onRenew(ledgers);
      setDone(true);
      setTimeout(() => { setDone(false); setOpen(false); }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="btn-secondary text-xs !px-3 !py-1.5"
        aria-label="Renew subscription"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Renew
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 space-y-3">
      <p className="text-xs font-medium text-gray-300">Add ledgers to TTL</p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={loading}
            onClick={() => handleRenew(p.ledgers)}
            className="btn-secondary text-xs !px-2.5 !py-1"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom */}
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom ledgers"
          className="input text-xs flex-1"
          aria-label="Custom ledger count"
        />
        <button
          type="button"
          disabled={loading || !custom || Number(custom) <= 0}
          onClick={() => handleRenew(Number(custom))}
          className="btn-primary text-xs !px-3"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : done ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            "Add"
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-gray-500 hover:text-gray-300 transition"
      >
        Cancel
      </button>
    </div>
  );
}
