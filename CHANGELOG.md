# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-08-19

### Added

#### Core scaffold & configuration
- Next.js 15, TypeScript, Tailwind CSS project scaffold
- Brand colour tokens (`brand`, `stellar`) and font tokens in `tailwind.config.ts`
- Global utility classes: `card`, `btn-primary`, `btn-secondary`, `input`, `badge-*` in `globals.css`
- Root layout with metadata, `Providers` wrapper, skip-to-content link, and `Navbar` slot
- `QueryClientProvider` with retry and stale-time config (`Providers.tsx`)
- `next.config.ts` — standalone output, reactStrictMode, gzip compression, no powered-by header
- `.env.local.example` — all `NEXT_PUBLIC_*` variables documented with comments
- `.gitignore` — full Next.js + Node.js coverage
- MIT `LICENSE`
- GitHub Actions CI — type-check, lint, build on every push/PR to `main`

#### Wallet & Stellar integration
- `useWallet` hook — connect, disconnect, address, connecting, error state
- `WalletButton` — connect button, truncated address, disconnect, Freighter install link
- `lib/wallet.ts` — Freighter v3 API (`getAddress`, `signTransaction`) with install detection
- `lib/stellar.ts` — `SorobanRpc` client, `buildTx`, `simulateRead`, `channelToScVal`,
  `callSubscribe`, `callCancel`, `callPause`, `callResume`, `callRenew`, `callUpdateEndpointRef`
- `lib/api.ts` — Axios client, `fetchSubscriptionsByOwner`, `fetchNotificationsBySubscription`,
  `fetchSubscription`, `registerEndpoint`, typed `SubscriptionRow` / `NotificationRow`
- `lib/hash.ts` — in-browser SHA-256 via Web Crypto API

#### Hooks
- `useSubscriptions` — React Query, 30s refetch
- `useNotifications` — React Query, 10s refetch
- `useSSE` — `EventSource` with stale-state cleanup on `subscriptionId` change
- `useCopyToClipboard` — clipboard write with 2s auto-reset

#### Pages
- `/` — Hero, stats grid, features grid, CTA
- `/dashboard` — Wallet gate, subscriptions list, notification feed panel, TX toast
- `/dashboard/[id]` — Full subscription detail, notification history chart, live feed
- `/explorer` — Address search, subscription results

#### Components — Layout
- `Navbar` — Logo, desktop nav links, GitHub icon, `WalletButton`, hamburger trigger
- `MobileNavDrawer` — Slide-in drawer with Escape/backdrop close, focus management, scroll lock

#### Components — Subscriptions
- `SubscriptionCard` — Status badge, `ChannelBadge`, expiry countdown, copy ID,
  pause/resume/cancel/details actions, renew button
- `CreateSubscriptionForm` — Zod validation, channel select, tag editor for topics,
  TTL input, endpoint hash generator, URL → SHA-256 auto-fill
- `RegisterEndpointForm` — 3-step flow: URL → hash preview + API key → confirmed
- `RenewButton` — Preset durations + custom ledger input, calls `renew_sub()` on-chain
- `UpdateEndpointRefForm` — URL → hash helper, calls `update_endpoint_ref()` on-chain
- `ExpiryCountdown` — Live ticker using RPC ledger sequence, yellow/red urgency colours

#### Components — Notifications
- `NotificationFeed` — Polled list + SSE live prepend + `NotificationStatusBadge` + live indicator
- `NotificationChart` — Hourly-bucketed `LineChart` (delivered / failed / pending) via Recharts

#### Components — UI
- `ChannelBadge` — Colour-coded Webhook / InApp / OnChain pills
- `NotificationStatusBadge` — delivered / failed / pending / retrying pills
- `EmptyState` — Reusable zero-data screen with icon, title, description, action slot
- `LoadingSpinner` — Accessible `role="status"` spinner, three size variants
- `ErrorBanner` — `role="alert"` with optional dismiss button
- `TxToast` — Fixed bottom-right pending / confirmed / failed toast with Explorer link
- `CopyButton` — Copy icon → green checkmark on success
- `TagEditor` — Add/remove chip input (Enter/comma to add, Backspace to remove last)
- `LiveAnnouncer` — Global `aria-live` polite/assertive regions via React context

#### Accessibility
- Skip-to-content link (visually hidden until focused)
- `aria-live` region for screen reader announcements on new notifications
- `aria-label` on all icon-only buttons and interactive elements
- Keyboard navigation on `SubscriptionCard` (`Enter` to activate)
- `role="dialog"` + `aria-modal` on mobile nav drawer

### Fixed
- Freighter API v3 breaking changes — `getPublicKey` → `getAddress`, `signTransaction` return type
- SSE stale-state leak on subscription switch — `activeIdRef` guard + immediate state reset
- Freighter not installed — show install link instead of generic error
- ESLint CI — replaced deprecated `next lint` with direct ESLint CLI + `.eslintrc.json`

---

[0.1.0]: https://github.com/yourusername/stellarnotify-frontend/releases/tag/v0.1.0
