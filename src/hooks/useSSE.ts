"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!subscriptionId) return;

    const es = new EventSource(`${API_URL}/sse/${subscriptionId}`);

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as SSENotification;
        setLatest(parsed);
      } catch {
        // malformed message — ignore
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [subscriptionId]);

  return { latest, connected };
}
