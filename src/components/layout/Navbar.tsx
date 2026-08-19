"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Github } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Bell className="h-5 w-5 text-brand-light" />
          <span>StellarNotify</span>
        </Link>

        {/* Nav links */}
        <ul className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith(l.href)
                    ? "bg-brand/20 text-brand-light"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/yourusername/stellarnotify-contract"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-gray-400 hover:text-gray-100 transition"
          >
            <Github className="h-5 w-5" />
          </Link>
          <WalletButton />
        </div>
      </nav>
    </header>
  );
}
