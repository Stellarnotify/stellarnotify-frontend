"use client";

import { useState } from "react";
import { Plus, Loader2, X, Hash } from "lucide-react";
import { z } from "zod";
import { sha256Hex } from "@/lib/hash";
import { TagEditor } from "@/components/ui/TagEditor";

// Stellar contract address validation
const stellarContractRegex = /^C[A-Z0-9]{55}$/;

const schema = z.object({
  watchedContract: z
    .string()
    .min(1, "Contract address is required")
    .regex(stellarContractRegex, "Must be a valid Stellar contract address (starts with 'C' and is 56 characters)"),
  channel: z.enum(["Webhook", "InApp", "OnChain"]),
  endpointRef: z
    .string()
    .min(1, "Endpoint reference is required")
    .regex(/^[a-f0-9]{64}$/i, "Must be a valid 64-character hexadecimal hash"),
  ttlLedgers: z.coerce
    .number({ invalid_type_error: "TTL must be a number" })
    .min(0, "TTL must be 0 or greater")
    .max(1_000_000, "TTL must not exceed 1,000,000 ledgers"),
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
  const [hashing, setHashing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookUrlError, setWebhookUrlError] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [form, setForm] = useState({
    watchedContract: "",
    channel: "Webhook" as const,
    endpointRef: "",
    ttlLedgers: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleHashUrl = async () => {
    if (!webhookUrl.trim()) {
      setErrors((prev) => ({ ...prev, webhookUrl: "Please enter a webhook URL" }));
      return;
    }
    
    // Basic URL validation
    try {
      new URL(webhookUrl.trim());
    } catch {
      setErrors((prev) => ({ ...prev, webhookUrl: "Please enter a valid URL (e.g., https://example.com/webhook)" }));
      return;
    }
    
    setHashing(true);
    setErrors((prev) => ({ ...prev, webhookUrl: "" }));
    try {
      const hex = await sha256Hex(webhookUrl.trim());
      setForm((prev) => ({ ...prev, endpointRef: hex }));
      setErrors((prev) => ({ ...prev, endpointRef: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, webhookUrl: "Failed to generate hash. Please try again." }));
    } finally {
      setHashing(false);
    }
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
      
      // Focus first error field
      const firstErrorField = Object.keys(fieldErrors)[0];
      const element = document.getElementById(firstErrorField);
      element?.focus();
      
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ ...result.data, topics });
      setOpen(false);
      setForm({ watchedContract: "", channel: "Webhook", endpointRef: "", ttlLedgers: 0 });
      setTopics([]);
      setWebhookUrl("");
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create subscription. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
        <Plus className="h-4 w-4" /> New Subscription
      </button>
    );
  }

  return (
    <div className="card space-y-3 sm:space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base sm:text-lg">Create Subscription</h3>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close form"
          className="text-gray-500 hover:text-gray-300 p-1"
        >
          <X className="h-5 w-5 sm:h-4 sm:w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
        {/* Contract */}
        <div>
          <label htmlFor="watchedContract" className="label">Contract Address *</label>
          <input
            id="watchedContract"
            name="watchedContract"
            value={form.watchedContract}
            onChange={handleChange}
            placeholder="CXXXX... (56 characters)"
            className={`input ${errors.watchedContract ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            aria-describedby={errors.watchedContract ? "wc-err" : undefined}
            aria-invalid={!!errors.watchedContract}
          />
          {errors.watchedContract && (
            <p id="wc-err" className="mt-1 text-xs text-red-400" role="alert">{errors.watchedContract}</p>
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
            <span className="ml-1 sm:ml-2 text-xs text-gray-500 block sm:inline mt-0.5 sm:mt-0">
              (SHA-256 of your webhook URL)
            </span>
          </label>

          {/* URL → hash helper */}
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <div className="flex-1">
              <input
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, webhookUrl: "" }));
                }}
                placeholder="https://your-server.com/webhook"
                className={`input flex-1 text-xs ${errors.webhookUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                aria-label="Webhook URL to hash"
                aria-describedby={errors.webhookUrl ? "url-err" : undefined}
                aria-invalid={!!errors.webhookUrl}
              />
              {errors.webhookUrl && (
                <p id="url-err" className="mt-1 text-xs text-red-400" role="alert">{errors.webhookUrl}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleHashUrl}
              disabled={hashing || !webhookUrl.trim()}
              className="btn-secondary shrink-0 !px-3 w-full sm:w-auto"
              title="Compute SHA-256 hash"
              aria-label="Compute SHA-256 hash of webhook URL"
            >
              {hashing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Hash className="h-4 w-4" />
              )}
              <span className="sm:hidden ml-2">Compute Hash</span>
            </button>
          </div>

          <input
            id="endpointRef"
            name="endpointRef"
            value={form.endpointRef}
            onChange={handleChange}
            placeholder="64-char hex hash"
            className={`input font-mono text-xs break-all ${errors.endpointRef ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            aria-describedby={errors.endpointRef ? "ep-err" : undefined}
            aria-invalid={!!errors.endpointRef}
          />
          {errors.endpointRef && (
            <p id="ep-err" className="mt-1 text-xs text-red-400" role="alert">{errors.endpointRef}</p>
          )}
        </div>

        {/* Topics — tag editor */}
        <div>
          <p className="label">
            Topic Filters
            <span className="ml-1 sm:ml-2 text-xs text-gray-500 block sm:inline mt-0.5 sm:mt-0">
              (press Enter or comma to add · max 10)
            </span>
          </p>
          <TagEditor
            tags={topics}
            onChange={setTopics}
            placeholder="e.g. sub_new"
            maxTags={10}
          />
        </div>

        {/* TTL */}
        <div>
          <label htmlFor="ttlLedgers" className="label">
            TTL Ledgers
            <span className="ml-1 sm:ml-2 text-xs text-gray-500 block sm:inline mt-0.5 sm:mt-0">
              (0 = no expiry)
            </span>
          </label>
          <input
            id="ttlLedgers"
            name="ttlLedgers"
            type="number"
            min={0}
            max={1000000}
            value={form.ttlLedgers}
            onChange={handleChange}
            className={`input ${errors.ttlLedgers ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            aria-describedby={errors.ttlLedgers ? "ttl-err" : undefined}
            aria-invalid={!!errors.ttlLedgers}
          />
          {errors.ttlLedgers && (
            <p id="ttl-err" className="mt-1 text-xs text-red-400" role="alert">{errors.ttlLedgers}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          {errors.submit && (
            <p className="w-full text-xs text-red-400 text-center" role="alert">{errors.submit}</p>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? "Creating…" : "Create Subscription"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary sm:w-auto w-full justify-center">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
