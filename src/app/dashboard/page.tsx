"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionSkeleton } from "@/components/subscriptions/SubscriptionSkeleton";
import { SubscriptionSearch } from "@/components/subscriptions/SubscriptionSearch";
import { CreateSubscriptionForm } from "@/components/subscriptions/CreateSubscriptionForm";
import { RegisterEndpointForm } from "@/components/subscriptions/RegisterEndpointForm";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { useNotifications } from "@/hooks/useSubscriptions";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TxToast } from "@/components/ui/TxToast";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import type { TxToastState } from "@/components/ui/TxToast";
import { callSubscribe, callCancel, callPause, callResume, callRenew } from "@/lib/stellar";
import { Wallet, Bell, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { address, connect, connecting } = useWallet();
  const { data: subs, isLoading, refetch } = useSubscriptions(address);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: notifications } = useNotifications(selectedId);
  const [toast, setToast] = useState<TxToastState | null>(null);
  const createFormRef = useRef<{ triggerOpen: () => void } | null>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      description: "Create new subscription",
      action: () => {
        if (address) {
          createFormRef.current?.triggerOpen();
        }
      },
    },
    {
      key: "r",
      description: "Refresh subscriptions",
      action: () => {
        if (address) {
          refetch();
        }
      },
    },
  ], !!address); // Only enable when wallet is connected

  // Filter subscriptions based on search query
  const filteredSubs = useMemo(() => {
    if (!subs || !searchQuery.trim()) return subs;
    
    const query = searchQuery.toLowerCase();
    return subs.filter((sub) => {
      const contractMatch = sub.watched_contract.toLowerCase().includes(query);
      const channelMatch = sub.channel.toLowerCase().includes(query);
      return contractMatch || channelMatch;
    });
  }, [subs, searchQuery]);

  /** Generic wrapper: shows pending → confirmed/failed toast around any on-chain call */
  const withToast = useCallback(
    async (label: string, fn: () => Promise<string>) => {
      setToast({ status: "pending", message: `${label}…` });
      try {
        const hash = await fn();
        setToast({ status: "confirmed", message: `${label} confirmed`, hash });
        await refetch();
      } catch (err: unknown) {
        setToast({
          status: "failed",
          message: err instanceof Error ? err.message : `${label} failed`,
        });
      }
    },
    [refetch]
  );

  const handleCreate = useCallback(
    async (values: {
      watchedContract: string;
      channel: "Webhook" | "InApp" | "OnChain";
      endpointRef: string;
      ttlLedgers: number;
      topics: string[];
    }) => {
      if (!address) return;
      await withToast("Subscription created", () =>
        callSubscribe({ callerAddress: address, ...values })
      );
    },
    [address, withToast]
  );

  const handleCancel = useCallback(async (id: string) => {
    if (!address) return;
    await withToast("Subscription cancelled", () =>
      callCancel({ callerAddress: address, subscriptionId: id })
    );
  }, [address, withToast]);

  const handlePause = useCallback(async (id: string) => {
    if (!address) return;
    await withToast("Subscription paused", () =>
      callPause({ callerAddress: address, subscriptionId: id })
    );
  }, [address, withToast]);

  const handleResume = useCallback(async (id: string) => {
    if (!address) return;
    await withToast("Subscription resumed", () =>
      callResume({ callerAddress: address, subscriptionId: id })
    );
  }, [address, withToast]);

  const handleRenew = useCallback(async (id: string, additionalLedgers: number) => {
    if (!address) return;
    await withToast("Subscription renewed", () =>
      callRenew({ callerAddress: address, subscriptionId: id, additionalLedgers })
    );
  }, [address, withToast]);

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
        <div className="flex items-center gap-2">
          <RegisterEndpointForm ownerAddress={address} />
          <CreateSubscriptionForm ref={createFormRef} onSubmit={handleCreate} />
        </div>
      </div>

      {/* TX error */}

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscriptions list */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700">
            Your Subscriptions
            {subs && <span className="ml-2 text-xs text-gray-500">({filteredSubs?.length || 0} / {subs.length})</span>}
          </h2>

          {!isLoading && subs && subs.length > 0 && (
            <SubscriptionSearch value={searchQuery} onChange={setSearchQuery} />
          )}

          {isLoading && (
            <ul className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <SubscriptionSkeleton />
                </li>
              ))}
            </ul>
          )}

          {!isLoading && (!subs || subs.length === 0) && (
            <EmptyState
              icon={Bell}
              title="No subscriptions yet"
              description="Create one to start receiving on-chain event notifications."
            />
          )}

          {!isLoading && subs && subs.length > 0 && filteredSubs && filteredSubs.length === 0 && (
            <EmptyState
              icon={Bell}
              title="No matches found"
              description="Try adjusting your search query."
            />
          )}

          {!isLoading && filteredSubs && filteredSubs.length > 0 && (
            <ul className="space-y-3">
              {filteredSubs.map((sub) => (
                <li key={sub.id}>
                  <SubscriptionCard
                    sub={sub}
                    onCancel={handleCancel}
                    onPause={handlePause}
                    onResume={handleResume}
                    onRenew={handleRenew}
                    onClick={setSelectedId}
                  />
                </li>
              ))}
            </ul>
          )}
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
      <TxToast toast={toast} onDismiss={() => setToast(null)} />
      <KeyboardShortcutsHelp />
    </div>
  );
}
