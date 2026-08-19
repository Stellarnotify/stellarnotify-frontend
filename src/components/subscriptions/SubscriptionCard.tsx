"use client";

import { Bell, BellOff, Trash2, ExternalLink } from "lucide-react";
import type { SubscriptionRow } from "@/lib/api";

interface Props {
  sub: SubscriptionRow;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onClick: (id: string) => void;
}

const channelLabel: Record<string, string> = {
  Webhook: "🔗 Webhook",
  InApp: "📡 In-App",
  OnChain: "⛓ On-Chain",
};

export function SubscriptionCard({ sub, onCancel, onPause, onResume, onClick }: Props) {
  const isExpired =
    sub.expires_at_ledger > 0 && sub.expires_at_ledger < Date.now() / 1000;

  const statusBadge = isExpired
    ? <span className="badge-expired">Expired</span>
    : sub.active
    ? <span className="badge-active">Active</span>
    : <span className="badge-paused">Paused</span>;

  return (
    <div
      className="card cursor-pointer hover:border-brand/50 transition group"
      onClick={() => onClick(sub.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(sub.id)}
      aria-label={`Subscription ${sub.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {statusBadge}
            <span className="text-xs text-gray-500 font-mono">#{sub.id}</span>
          </div>
          <p className="text-sm text-gray-300 font-mono truncate">
            Watching: {sub.watched_contract}
          </p>
          <p className="text-xs text-gray-500">
            {channelLabel[sub.channel] ?? sub.channel}
            {sub.topics.length > 0 && ` · ${sub.topics.length} topic filter(s)`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {!isExpired && sub.active && (
            <button
              onClick={(e) => { e.stopPropagation(); onPause(sub.id); }}
              aria-label="Pause subscription"
              className="btn-secondary !px-2 !py-2"
              title="Pause"
            >
              <BellOff className="h-3.5 w-3.5" />
            </button>
          )}
          {!isExpired && !sub.active && (
            <button
              onClick={(e) => { e.stopPropagation(); onResume(sub.id); }}
              aria-label="Resume subscription"
              className="btn-secondary !px-2 !py-2"
              title="Resume"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(sub.id); }}
            aria-label="Cancel subscription"
            className="btn-secondary !px-2 !py-2 hover:!border-red-700 hover:!text-red-400"
            title="Cancel"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="View details"
            className="btn-secondary !px-2 !py-2"
            title="Details"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
