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
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
