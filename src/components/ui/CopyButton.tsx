"use client";

import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className = "" }: Props) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
      className={`inline-flex items-center justify-center rounded p-1 text-gray-500
                  hover:text-gray-200 transition ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
