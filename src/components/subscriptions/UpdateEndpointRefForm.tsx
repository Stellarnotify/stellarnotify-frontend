"use client";

import { useState } from "react";
import { Pencil, Loader2, Check, X, Hash } from "lucide-react";
import { sha256Hex } from "@/lib/hash";

interface Props {
  currentRef: string;
  onUpdate: (newRef: string) => Promise<void>;
}

export function UpdateEndpointRefForm({ currentRef, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [newRef, setNewRef] = useState("");
  const [hashing, setHashing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHash = async () => {
    if (!webhookUrl.trim()) return;
    setHashing(true);
    setError(null);
    try {
      const hex = await sha256Hex(webhookUrl.trim());
      setNewRef(hex);
    } catch {
      setError("Failed to compute hash.");
    } finally {
      setHashing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef.trim() || newRef === currentRef) return;
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate(newRef.trim());
      setDone(true);
      setTimeout(() => { setDone(false); setOpen(false); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setWebhookUrl("");
    setNewRef("");
    setError(null);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-xs !px-3 !py-1.5"
        aria-label="Update endpoint reference"
      >
        <Pencil className="h-3.5 w-3.5" /> Update Endpoint Ref
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200">Update Endpoint Reference</p>
        <button type="button" onClick={handleClose} aria-label="Cancel" className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Current */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Current ref</p>
        <p className="text-xs font-mono text-gray-400 break-all">{currentRef}</p>
      </div>

      {/* Hash helper */}
      <div>
        <label className="label text-xs">New webhook URL (optional — auto-hash)</label>
        <div className="flex gap-2">
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://…"
            className="input text-xs flex-1"
            aria-label="New webhook URL"
          />
          <button
            type="button"
            onClick={handleHash}
            disabled={hashing || !webhookUrl.trim()}
            className="btn-secondary !px-3 shrink-0"
            aria-label="Compute hash"
          >
            {hashing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hash className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* New ref */}
      <div>
        <label htmlFor="new-endpoint-ref" className="label text-xs">New endpoint ref *</label>
        <input
          id="new-endpoint-ref"
          value={newRef}
          onChange={(e) => setNewRef(e.target.value)}
          placeholder="64-char hex hash"
          className="input font-mono text-xs"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !newRef.trim() || newRef === currentRef}
        className="btn-primary w-full text-xs"
      >
        {submitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Pencil className="h-3.5 w-3.5" />
        )}
        {done ? "Updated!" : submitting ? "Updating…" : "Update On-Chain"}
      </button>
    </form>
  );
}
