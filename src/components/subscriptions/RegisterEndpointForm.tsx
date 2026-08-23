"use client";

import { useState } from "react";
import { Link2, Loader2, X, CheckCircle2, Hash } from "lucide-react";
import { sha256Hex } from "@/lib/hash";
import { registerEndpoint } from "@/lib/api";

interface Props {
  ownerAddress: string;
}

type Step = "input" | "preview" | "done";

export function RegisterEndpointForm({ ownerAddress }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hash, setHash] = useState("");
  const [hashing, setHashing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
    setStep("input");
    setWebhookUrl("");
    setApiKey("");
    setHash("");
    setError(null);
  };

  const handleHash = async () => {
    if (!webhookUrl.trim()) return;
    setHashing(true);
    setError(null);
    try {
      const hex = await sha256Hex(webhookUrl.trim());
      setHash(hex);
      setStep("preview");
    } catch {
      setError("Failed to compute hash.");
    } finally {
      setHashing(false);
    }
  };

  const handleRegister = async () => {
    if (!hash || !webhookUrl || !apiKey) return;
    setSubmitting(true);
    setError(null);
    try {
      await registerEndpoint(hash, webhookUrl.trim(), ownerAddress, apiKey.trim());
      setStep("done");
    } catch {
      setError("Registration failed. Check your API key and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-xs">
        <Link2 className="h-3.5 w-3.5" /> Register Endpoint
      </button>
    );
  }

  return (
    <div className="card space-y-4 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Register Webhook Endpoint</h3>
        <button
          onClick={handleClose}
          aria-label="Close form"
          className="text-gray-500 hover:text-gray-300 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step: input */}
      {step === "input" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Enter your webhook URL. We&apos;ll compute its SHA-256 hash — this hash is
            what gets stored on-chain as your endpoint reference.
          </p>
          <div>
            <label htmlFor="reg-url" className="label">Webhook URL *</label>
            <input
              id="reg-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="input"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleHash}
            disabled={hashing || !webhookUrl.trim()}
            className="btn-primary w-full"
          >
            {hashing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Hash className="h-4 w-4" />
            )}
            {hashing ? "Computing hash…" : "Compute Hash & Continue"}
          </button>
        </div>
      )}

      {/* Step: preview + API key */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800 p-3 space-y-1">
            <p className="text-xs text-gray-500">Webhook URL</p>
            <p className="text-sm text-gray-100 break-all">{webhookUrl}</p>
          </div>
          <div className="rounded-lg bg-gray-800 p-3 space-y-1">
            <p className="text-xs text-gray-500">SHA-256 Hash (endpoint ref)</p>
            <p className="text-xs font-mono text-brand-light break-all">{hash}</p>
          </div>
          <div>
            <label htmlFor="reg-apikey" className="label">
              API Key *
              <span className="ml-2 text-xs text-gray-500">
                (issued by the StellarNotify backend)
              </span>
            </label>
            <input
              id="reg-apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-…"
              className="input"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleRegister}
              disabled={submitting || !apiKey.trim()}
              className="btn-primary flex-1"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {submitting ? "Registering…" : "Register Endpoint"}
            </button>
            <button
              type="button"
              onClick={() => setStep("input")}
              className="btn-secondary"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <div>
            <p className="font-semibold text-gray-100">Endpoint registered!</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the hash below as your endpoint reference when creating subscriptions.
            </p>
          </div>
          <p className="text-xs font-mono text-brand-light break-all bg-gray-800 rounded px-3 py-2 w-full">
            {hash}
          </p>
          <button onClick={handleClose} className="btn-secondary mt-2">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
