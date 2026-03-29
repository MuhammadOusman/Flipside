"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/store/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Don't track admin pages
    if (!pathname.startsWith("/admin")) {
      trackPageView(pathname);
    }
  }, [pathname, trackPageView]);

  return <>{children}</>;
}
