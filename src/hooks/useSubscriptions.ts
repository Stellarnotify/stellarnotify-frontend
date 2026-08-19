"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionsByOwner, fetchNotificationsBySubscription } from "@/lib/api";

export function useSubscriptions(owner: string | null) {
  return useQuery({
    queryKey: ["subscriptions", owner],
    queryFn: () => fetchSubscriptionsByOwner(owner!),
    enabled: !!owner,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useNotifications(subscriptionId: string | null, limit = 50) {
  return useQuery({
    queryKey: ["notifications", subscriptionId, limit],
    queryFn: () => fetchNotificationsBySubscription(subscriptionId!, limit),
    enabled: !!subscriptionId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}
