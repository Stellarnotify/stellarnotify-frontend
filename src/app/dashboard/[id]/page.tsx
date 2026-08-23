"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscription, fetchNotificationsBySubscription } from "@/lib/api";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { NotificationChart } from "@/components/notifications/NotificationChart";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ExpiryCountdown } from "@/components/subscriptions/ExpiryCountdown";
import { UpdateEndpointRefForm } from "@/components/subscriptions/UpdateEndpointRefForm";
import { TxToast } from "@/components/ui/TxToast";
import type { TxToastState } from "@/components/ui/TxToast";
import { callUpdateEndpointRef } from "@/lib/stellar";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import Link from "next/link";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-800 last:border-0">
      <dt className="w-44 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-100 break-all">{value}</dd>
    </div>
  );
}

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: sub,
    isLoading: subLoading,
    error: subError,
  } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => fetchSubscription(id),
    staleTime: 30_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", id, 50],
    queryFn: () => fetchNotificationsBySubscription(id, 50),
    enabled: !!id,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const [toast, setToast] = useState<TxToastState | null>(null);

  const handleUpdateRef = async (newRef: string) => {
    if (!sub) return;
    setToast({ status: "pending", message: "Updating endpoint ref…" });
    try {
      // walletAddress not available here — caller must be the owner
      const hash = await callUpdateEndpointRef({
        callerAddress: sub.owner,
        subscriptionId: id,
        newEndpointRef: newRef,
      });
      setToast({ status: "confirmed", message: "Endpoint ref updated", hash });
    } catch (err: unknown) {
      setToast({
        status: "failed",
        message: err instanceof Error ? err.message : "Update failed",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Loading */}
      {subLoading && <LoadingSpinner label="Loading subscription…" />}

      {/* Error */}
      {subError && (
        <ErrorBanner
          message={subError instanceof Error ? subError.message : "Failed to load subscription"}
        />
      )}

      {sub && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Subscription Detail</h1>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-sm font-mono text-gray-400">#{sub.id}</p>
                <CopyButton text={sub.id} label="Copy subscription ID" />
              </div>
            </div>
            <div>
              {sub.active ? (
                <span className="badge-active">Active</span>
              ) : (
                <span className="badge-paused">Paused</span>
              )}
            </div>
          </div>

          {/* Details card */}
          <section className="card">
            <h2 className="font-semibold text-gray-200 mb-2">Details</h2>
            <dl>
              <DetailRow label="Subscription ID" value={sub.id} />
              <DetailRow label="Owner" value={sub.owner} />
              <DetailRow
                label="Watched Contract"
                value={
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{sub.watched_contract}</span>
                    <CopyButton text={sub.watched_contract} label="Copy contract address" />
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${sub.watched_contract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View contract on Stellar Expert"
                      className="text-brand-light hover:text-brand transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </span>
                }
              />
              <DetailRow label="Channel" value={<ChannelBadge channel={sub.channel} />} />
              <DetailRow
                label="Endpoint Ref"
                value={<span className="font-mono text-xs">{sub.endpoint_ref}</span>}
              />
              <DetailRow
                label="Update Endpoint"
                value={
                  <UpdateEndpointRefForm
                    currentRef={sub.endpoint_ref}
                    onUpdate={handleUpdateRef}
                  />
                }
              />
              <DetailRow
                label="Topic Filters"
                value={
                  sub.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {sub.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">All events (no filter)</span>
                  )
                }
              />
              <DetailRow
                label="Created at Ledger"
                value={sub.created_at_ledger.toLocaleString()}
              />
              <DetailRow
                label="Expires at Ledger"
                value={
                  sub.expires_at_ledger === 0 ? (
                    <span className="text-gray-500">Never</span>
                  ) : (
                    sub.expires_at_ledger.toLocaleString()
                  )
                }
              />
              <DetailRow
                label="Time Remaining"
                value={<ExpiryCountdown expiresAtLedger={sub.expires_at_ledger} />}
              />
              <DetailRow
                label="Last Synced"
                value={new Date(sub.synced_at).toLocaleString()}
              />
            </dl>
          </section>

          {/* Notification chart */}
          {notifications && notifications.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-gray-200">Deliveries Over Time</h2>
              <div className="card !p-4">
                <NotificationChart notifications={notifications} />
              </div>
            </section>
          )}

          {/* Notification feed */}
          <section className="space-y-4">
            <h2 className="font-semibold text-gray-200">Notification History</h2>
            <NotificationFeed
              subscriptionId={sub.id}
              initialNotifications={notifications ?? []}
            />
          </section>
        </>
      )}
      <TxToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
