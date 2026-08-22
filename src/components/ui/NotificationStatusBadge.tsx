import type { NotificationRow } from "@/lib/api";

type Status = NotificationRow["status"];

const styles: Record<Status, string> = {
  delivered:
    "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  failed:
    "bg-red-900/40 text-red-300 ring-1 ring-inset ring-red-500/30",
  pending:
    "bg-yellow-900/40 text-yellow-300 ring-1 ring-inset ring-yellow-500/30",
  retrying:
    "bg-blue-900/40 text-blue-300 ring-1 ring-inset ring-blue-500/30",
};

const label: Record<Status, string> = {
  delivered: "✓ Delivered",
  failed: "✕ Failed",
  pending: "⏳ Pending",
  retrying: "↻ Retrying",
};

interface Props {
  status: Status;
  className?: string;
}

export function NotificationStatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]} ${className}`}
    >
      {label[status]}
    </span>
  );
}
