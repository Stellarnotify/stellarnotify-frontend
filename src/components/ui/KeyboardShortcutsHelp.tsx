"use client";

import { X, Keyboard } from "lucide-react";
import { useState, useEffect } from "react";

interface ShortcutItem {
  keys: string[];
  description: string;
  category?: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ["?"], description: "Show keyboard shortcuts", category: "General" },
  { keys: ["N"], description: "Create new subscription", category: "Actions" },
  { keys: ["R"], description: "Refresh subscriptions", category: "Actions" },
  { keys: ["Esc"], description: "Close modals/dialogs", category: "Navigation" },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open help with '?'
      if (e.key === "?" && !isOpen) {
        const target = e.target as HTMLElement;
        // Don't open if typing in input
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-800 hover:bg-gray-700 
                   border border-gray-700 shadow-lg transition-all hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-brand z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-5 w-5 text-gray-300" />
      </button>
    );
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Keyboard className="h-6 w-6 text-brand" />
              <h2 id="shortcuts-title" className="text-xl font-semibold">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-800/50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg 
                                 hover:bg-gray-800/30 transition"
                    >
                      <span className="text-sm text-gray-300">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 
                                     border border-gray-700 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
