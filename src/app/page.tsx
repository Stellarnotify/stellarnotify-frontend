import Link from "next/link";
import { Bell, Zap, Globe, Shield, ArrowRight, Code2 } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "On-Chain Subscriptions",
    description:
      "Subscribe to any Soroban smart contract event directly from your wallet. No central authority, no API keys — just your address and a contract.",
  },
  {
    icon: Zap,
    title: "Real-Time Delivery",
    description:
      "Events are ingested within seconds of ledger close and dispatched via webhook, in-app SSE stream, or on-chain re-emission.",
  },
  {
    icon: Globe,
    title: "Any Contract, Any App",
    description:
      "Watch escrows, lending pools, DAOs, streams, NFTs — any Soroban contract that emits events. Topic filters let you receive only what you care about.",
  },
  {
    icon: Shield,
    title: "Open Source & Self-Hostable",
    description:
      "MIT licensed. Run your own node or use the hosted service. All subscription data lives on-chain — no vendor lock-in ever.",
  },
];

const stats = [
  { label: "Delivery channels", value: "3" },
  { label: "Max topics / subscription", value: "10" },
  { label: "Avg latency (testnet)", value: "< 6s" },
  { label: "License", value: "MIT" },
];

export default function HomePage() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="pt-16 pb-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-medium text-brand-light">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
          Built for the Stellar Ecosystem · Soroban-native
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          On-chain event notifications
          <br />
          <span className="text-brand-light">for every Soroban contract</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          StellarNotify lets any wallet subscribe to smart contract events on Stellar.
          Get webhooks, in-app alerts, and on-chain re-emissions — automatically,
          without running your own indexer.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-primary text-base px-6 py-3">
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/yourusername/stellarnotify-contract"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base px-6 py-3"
          >
            <Code2 className="h-4 w-4" /> View on GitHub
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center space-y-1">
            <p className="text-3xl font-bold text-brand-light">{s.value}</p>
            <p className="text-sm text-gray-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Everything you need to stay in sync
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card flex gap-4">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                <f.icon className="h-5 w-5 text-brand-light" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center space-y-4 py-12">
        <h2 className="text-2xl font-bold">Ready to subscribe?</h2>
        <p className="text-gray-400">
          Connect your Freighter wallet and create your first subscription in under
          60 seconds.
        </p>
        <Link href="/dashboard" className="btn-primary mx-auto">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
