"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";

export type TxStatus = "pending" | "confirmed" | "failed";

export interface TxToastState {
  status: TxStatus;
  message: string;
  hash?: string;
}

interface Props {
  toast: TxToastState | null;
  onDismiss: () => void;
}

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

export function TxToast({ toast, onDismiss }: Props) {
  // Auto-dismiss on confirmed after 5 s
  useEffect(() => {
    if (toast?.status !== "confirmed") return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const { status, message, hash } = toast;

  const icon =
    status === "pending" ? (
      <Loader2 className="h-4 w-4 animate-spin text-brand-light shrink-0" aria-hidden="true" />
    ) : status === "confirmed" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
    );

  const containerClass =
    status === "pending"
      ? "border-brand/40 bg-gray-900"
      : status === "confirmed"
      ? "border-emerald-700/50 bg-emerald-950/40"
      : "border-red-700/50 bg-red-950/40";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border px-4 py-3
                  shadow-2xl max-w-sm text-sm ${containerClass}`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-100">{message}</p>
        {hash && status === "confirmed" && (
          <a
            href={`${EXPLORER_BASE}/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-light hover:underline mt-0.5 block truncate"
          >
            View on Explorer ↗
          </a>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-gray-500 hover:text-gray-200 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
