"use client";

import { useEffect, useRef, useState } from "react";

export interface SSENotification {
  notificationId: string;
  contractId: string;
  topics: string[];
  data: Record<string, unknown>;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useSSE(subscriptionId: string | null) {
  const [latest, setLatest] = useState<SSENotification | null>(null);
  const [connected, setConnected] = useState(false);
  // Track the active subscriptionId so stale event handlers never update state
  // for a connection that has already been torn down.
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!subscriptionId) {
      // Reset state when no subscription is selected
      setLatest(null);
      setConnected(false);
      activeIdRef.current = null;
      return;
    }

    // Reset stale state immediately before opening the new connection
    setLatest(null);
    setConnected(false);
    activeIdRef.current = subscriptionId;

    const es = new EventSource(`${API_URL}/sse/${subscriptionId}`);

    es.onopen = () => {
      if (activeIdRef.current === subscriptionId) setConnected(true);
    };

    es.onmessage = (event) => {
      // Discard messages that arrived after we switched away
      if (activeIdRef.current !== subscriptionId) return;
      try {
        const parsed = JSON.parse(event.data as string) as SSENotification;
        setLatest(parsed);
      } catch {
        // malformed message — ignore
      }
    };

    es.onerror = () => {
      if (activeIdRef.current === subscriptionId) setConnected(false);
    };

    return () => {
      // Close the old EventSource before the next effect run opens a new one
      es.close();
      setConnected(false);
      // Don't clear latest here — the new effect run will reset it above
    };
  }, [subscriptionId]);

  return { latest, connected };
}
