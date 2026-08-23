"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { CreateSubscriptionForm } from "@/components/subscriptions/CreateSubscriptionForm";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { useNotifications } from "@/hooks/useSubscriptions";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { callSubscribe } from "@/lib/stellar";
import { Wallet, Bell, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { address, connect, connecting } = useWallet();
  const { data: subs, isLoading, refetch } = useSubscriptions(address);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: notifications } = useNotifications(selectedId);
  const [txError, setTxError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (values: {
      watchedContract: string;
      channel: "Webhook" | "InApp" | "OnChain";
      endpointRef: string;
      ttlLedgers: number;
      topics: string[];
    }) => {
      if (!address) return;
      setTxError(null);
      try {
        await callSubscribe({ callerAddress: address, ...values });
        await refetch();
      } catch (err: unknown) {
        setTxError(err instanceof Error ? err.message : "Transaction failed");
      }
    },
    [address, refetch]
  );

  const handleCancel = useCallback((id: string) => {
    alert(`TODO: call contract cancel(${id})`);
  }, []);

  const handlePause = useCallback((id: string) => {
    alert(`TODO: call contract pause_sub(${id})`);
  }, []);

  const handleResume = useCallback((id: string) => {
    alert(`TODO: call contract resume_sub(${id})`);
  }, []);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/20">
          <Bell className="h-8 w-8 text-brand-light" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Connect your wallet</h1>
          <p className="text-gray-400 max-w-md">
            Connect your Freighter wallet to view and manage your StellarNotify subscriptions.
          </p>
        </div>
        <button onClick={connect} disabled={connecting} className="btn-primary text-base px-6 py-3">
          {connecting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
          ) : (
            <><Wallet className="h-4 w-4" /> Connect Wallet</>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-400 font-mono mt-1">{address}</p>
        </div>
        <CreateSubscriptionForm onSubmit={handleCreate} />
      </div>

      {/* TX error */}
      {txError && (
        <ErrorBanner message={txError} onDismiss={() => setTxError(null)} />
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscriptions list */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-300">
            Your Subscriptions
            {subs && <span className="ml-2 text-xs text-gray-500">({subs.length})</span>}
          </h2>

          {isLoading && <LoadingSpinner label="Loading subscriptions…" className="justify-start" />}

          {!isLoading && (!subs || subs.length === 0) && (
            <EmptyState
              icon={Bell}
              title="No subscriptions yet"
              description="Create one to start receiving on-chain event notifications."
            />
          )}

          <ul className="space-y-3">
            {subs?.map((sub) => (
              <li key={sub.id}>
                <SubscriptionCard
                  sub={sub}
                  onCancel={handleCancel}
                  onPause={handlePause}
                  onResume={handleResume}
                  onClick={setSelectedId}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Notification feed */}
        <section>
          {selectedId ? (
            <NotificationFeed
              subscriptionId={selectedId}
              initialNotifications={notifications ?? []}
            />
          ) : (
            <EmptyState
              icon={Bell}
              title="No subscription selected"
              description="Select a subscription from the list to view its notification feed."
            />
          )}
        </section>
      </div>
    </div>
  );
}
