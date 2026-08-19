"use client";

import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import type { NotificationRow } from "@/lib/api";
import { useSSE } from "@/hooks/useSSE";
import { useState, useEffect } from "react";

const statusIcon = {
  delivered: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  pending: <Clock className="h-4 w-4 text-yellow-400" />,
  retrying: <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />,
};

interface Props {
  subscriptionId: string;
  initialNotifications: NotificationRow[];
}

export function NotificationFeed({ subscriptionId, initialNotifications }: Props) {
  const { latest, connected } = useSSE(subscriptionId);
  const [liveItems, setLiveItems] = useState<NotificationRow[]>(initialNotifications);

  // Prepend live SSE notifications to the feed.
  useEffect(() => {
    if (!latest) return;
    const liveRow: NotificationRow = {
      id: latest.notificationId,
      subscription_id: subscriptionId,
      contract_id: latest.contractId,
      topics: latest.topics,
      data: latest.data,
      channel: "InApp",
      status: "delivered",
      attempts: 1,
      created_at: latest.timestamp,
      delivered_at: latest.timestamp,
      last_error: null,
    };
    setLiveItems((prev) => [liveRow, ...prev]);
  }, [latest, subscriptionId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notification Feed</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}
          />
          {connected ? "Live" : "Polling"}
        </div>
      </div>

      {liveItems.length === 0 && (
        <p className="text-sm text-gray-500 py-8 text-center">
          No notifications yet. They will appear here as events are detected.
        </p>
      )}

      <ul className="space-y-2" role="list" aria-label="Notification feed">
        {liveItems.map((n) => (
          <li key={n.id} className="card !p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {statusIcon[n.status]}
                <span className="text-xs font-mono text-gray-400 truncate">{n.contract_id}</span>
              </div>
              <span className="text-xs text-gray-600 shrink-0">
                {new Date(n.created_at).toLocaleTimeString()}
              </span>
            </div>
            {n.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {n.topics.map((t, i) => (
                  <span
                    key={i}
                    className="rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {n.last_error && (
              <p className="text-xs text-red-400">{n.last_error}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
