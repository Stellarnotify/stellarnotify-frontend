"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Github, Menu, Sun, Moon } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { useTheme } from "@/contexts/ThemeContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur bg-gray-950/80 dark:bg-gray-950/80 light:bg-white/80 border-gray-800 dark:border-gray-800 light:border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden transition text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Bell className="h-5 w-5 text-brand-light" />
            <span>StellarNotify</span>
          </Link>

          {/* Nav links — desktop only */}
          <ul className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.startsWith(l.href)
                      ? "bg-brand/20 text-brand-light"
                      : "text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="transition text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            <Link
              href="https://github.com/yourusername/stellarnotify-contract"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900"
            >
              <Github className="h-5 w-5" />
            </Link>
            <WalletButton />
          </div>
        </nav>
      </header>

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
