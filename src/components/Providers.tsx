"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LiveAnnouncer } from "@/components/ui/LiveAnnouncer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 2, staleTime: 15_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LiveAnnouncer>{children}</LiveAnnouncer>
    </QueryClientProvider>
  );
}
