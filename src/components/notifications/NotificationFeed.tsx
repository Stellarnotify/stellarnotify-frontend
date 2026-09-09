"use client";

import type { NotificationRow } from "@/lib/api";
import { NotificationStatusBadge } from "@/components/ui/NotificationStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useAnnouncer } from "@/components/ui/LiveAnnouncer";
import { Bell } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";
import { useState, useEffect, useMemo } from "react";

interface Props {
  subscriptionId: string;
  initialNotifications: NotificationRow[];
}

const ITEMS_PER_PAGE = 20;

export function NotificationFeed({ subscriptionId, initialNotifications }: Props) {
  const { latest, connected } = useSSE(subscriptionId);
  const { announce } = useAnnouncer();
  const [liveItems, setLiveItems] = useState<NotificationRow[]>(initialNotifications);
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1); // Reset to first page on new notification
    announce(`New notification from contract ${latest.contractId}`);
  }, [latest, subscriptionId, announce]);

  // Calculate pagination
  const totalPages = Math.ceil(liveItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return liveItems.slice(startIndex, endIndex);
  }, [liveItems, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="They will appear here as events are detected on-chain."
        />
      )}

      {liveItems.length > 0 && (
        <>
          <ul className="space-y-2" role="list" aria-label="Notification feed">
            {paginatedItems.map((n) => (
              <li key={n.id} className="card !p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <NotificationStatusBadge status={n.status} />
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
