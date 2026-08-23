"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { fetchSubscriptionsByOwner } from "@/lib/api";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { SubscriptionRow } from "@/lib/api";

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubscriptionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptionsByOwner(query.trim());
      setResults(data);
    } catch {
      setError("Could not fetch subscriptions. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Subscription Explorer</h1>
        <p className="text-sm text-gray-400 mt-1">
          Look up active subscriptions for any Stellar wallet address.
        </p>
      </div>

      <form onSubmit={search} className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a Stellar address (G...)"
          className="input flex-1"
          aria-label="Stellar address"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {results !== null && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            {results.length === 0
              ? "No subscriptions found for this address."
              : `${results.length} subscription(s) found`}
          </p>
          <ul className="space-y-3">
            {results.map((sub) => (
              <li key={sub.id}>
                <SubscriptionCard
                  sub={sub}
                  onCancel={() => {}}
                  onPause={() => {}}
                  onResume={() => {}}
                  onClick={() => {}}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
