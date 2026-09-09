import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "StellarNotify — On-Chain Event Notifications",
  description:
    "Subscribe to Soroban smart contract events and receive real-time notifications via webhook, in-app, or on-chain. Open-source infrastructure for the Stellar ecosystem.",
  openGraph: {
    title: "StellarNotify",
    description: "On-chain event notification infrastructure for Stellar/Soroban",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased bg-gray-950 dark:bg-gray-950 light:bg-white text-gray-100 dark:text-gray-100 light:text-gray-900">
        <Providers>
          {/* Skip-to-content — visually hidden until focused */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                       focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm
                       focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
          >
            Skip to content
          </a>
          <Navbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 outline-none"
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
