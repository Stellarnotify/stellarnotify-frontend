import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const api = axios.create({ baseURL: BASE_URL });

// ── Subscriptions ─────────────────────────────────────────────────────────

export async function fetchSubscriptionsByOwner(owner: string) {
  const res = await api.get(`/api/subscriptions/by-owner/${owner}`);
  return res.data.subscriptions as SubscriptionRow[];
}

export async function fetchSubscription(id: string) {
  const res = await api.get(`/api/subscriptions/${id}`);
  return res.data.subscription as SubscriptionRow;
}

export async function registerEndpoint(
  endpointHash: string,
  url: string,
  owner: string,
  apiKey: string
) {
  await api.post(
    "/api/subscriptions/endpoints",
    { endpointHash, url, owner },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
}

// ── Notifications ─────────────────────────────────────────────────────────

export async function fetchNotificationsBySubscription(
  subscriptionId: string,
  limit = 50,
  offset = 0
) {
  const res = await api.get(
    `/api/notifications/by-subscription/${subscriptionId}`,
    { params: { limit, offset } }
  );
  return res.data.notifications as NotificationRow[];
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface SubscriptionRow {
  id: string;
  owner: string;
  watched_contract: string;
  topics: string[];
  channel: "Webhook" | "InApp" | "OnChain";
  endpoint_ref: string;
  active: boolean;
  created_at_ledger: number;
  expires_at_ledger: number;
  synced_at: string;
}

export interface NotificationRow {
  id: string;
  subscription_id: string;
  contract_id: string;
  topics: string[];
  data: Record<string, unknown>;
  channel: string;
  status: "pending" | "delivered" | "failed" | "retrying";
  attempts: number;
  created_at: string;
  delivered_at: string | null;
  last_error: string | null;
}
