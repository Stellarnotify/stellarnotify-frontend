import type { SubscriptionRow } from "@/lib/api";

type Channel = SubscriptionRow["channel"];

const styles: Record<Channel, string> = {
  Webhook:
    "bg-blue-900/40 text-blue-300 ring-1 ring-inset ring-blue-500/30",
  InApp:
    "bg-purple-900/40 text-purple-300 ring-1 ring-inset ring-purple-500/30",
  OnChain:
    "bg-teal-900/40 text-teal-300 ring-1 ring-inset ring-teal-500/30",
};

const label: Record<Channel, string> = {
  Webhook: "🔗 Webhook",
  InApp: "📡 In-App",
  OnChain: "⛓ On-Chain",
};

interface Props {
  channel: Channel;
  className?: string;
}

export function ChannelBadge({ channel, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[channel]} ${className}`}
    >
      {label[channel]}
    </span>
  );
}
