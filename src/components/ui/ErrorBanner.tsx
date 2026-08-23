import { AlertCircle, X } from "lucide-react";

interface Props {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className = "" }: Props) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300 ${className}`}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 text-red-400 hover:text-red-200 transition"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
