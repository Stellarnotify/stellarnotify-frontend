"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  watchedContract: z.string().min(50, "Enter a valid Stellar contract address"),
  channel: z.enum(["Webhook", "InApp", "OnChain"]),
  endpointRef: z.string().min(8, "Endpoint reference is required"),
  ttlLedgers: z.coerce.number().min(0).max(1_000_000),
  topics: z.string(),
});

interface Props {
  onSubmit: (values: {
    watchedContract: string;
    channel: "Webhook" | "InApp" | "OnChain";
    endpointRef: string;
    ttlLedgers: number;
    topics: string[];
  }) => Promise<void>;
}

export function CreateSubscriptionForm({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    watchedContract: "",
    channel: "Webhook" as const,
    endpointRef: "",
    ttlLedgers: 0,
    topics: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...result.data,
        topics: result.data.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setOpen(false);
      setForm({ watchedContract: "", channel: "Webhook", endpointRef: "", ttlLedgers: 0, topics: "" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> New Subscription
      </button>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Create Subscription</h3>
        <button onClick={() => setOpen(false)} aria-label="Close form" className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Contract */}
        <div>
          <label htmlFor="watchedContract" className="label">Contract Address *</label>
          <input
            id="watchedContract"
            name="watchedContract"
            value={form.watchedContract}
            onChange={handleChange}
            placeholder="CXXXX..."
            className="input"
            aria-describedby={errors.watchedContract ? "wc-err" : undefined}
          />
          {errors.watchedContract && (
            <p id="wc-err" className="mt-1 text-xs text-red-400">{errors.watchedContract}</p>
          )}
        </div>

        {/* Channel */}
        <div>
          <label htmlFor="channel" className="label">Delivery Channel *</label>
          <select
            id="channel"
            name="channel"
            value={form.channel}
            onChange={handleChange}
            className="input"
          >
            <option value="Webhook">Webhook</option>
            <option value="InApp">In-App (SSE)</option>
            <option value="OnChain">On-Chain</option>
          </select>
        </div>

        {/* Endpoint ref */}
        <div>
          <label htmlFor="endpointRef" className="label">
            Endpoint Reference *
            <span className="ml-2 text-xs text-gray-500">(SHA-256 of your webhook URL)</span>
          </label>
          <input
            id="endpointRef"
            name="endpointRef"
            value={form.endpointRef}
            onChange={handleChange}
            placeholder="64-char hex hash"
            className="input font-mono text-xs"
            aria-describedby={errors.endpointRef ? "ep-err" : undefined}
          />
          {errors.endpointRef && (
            <p id="ep-err" className="mt-1 text-xs text-red-400">{errors.endpointRef}</p>
          )}
        </div>

        {/* Topics */}
        <div>
          <label htmlFor="topics" className="label">
            Topic Filters
            <span className="ml-2 text-xs text-gray-500">(comma-separated, leave blank for all events)</span>
          </label>
          <input
            id="topics"
            name="topics"
            value={form.topics}
            onChange={handleChange}
            placeholder="sub_new, sub_cancel"
            className="input"
          />
        </div>

        {/* TTL */}
        <div>
          <label htmlFor="ttlLedgers" className="label">
            TTL Ledgers
            <span className="ml-2 text-xs text-gray-500">(0 = no expiry)</span>
          </label>
          <input
            id="ttlLedgers"
            name="ttlLedgers"
            type="number"
            min={0}
            value={form.ttlLedgers}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? "Creating…" : "Create Subscription"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
