"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function getSessionId(): string {
  const key = "mm_sid";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    try {
      const sessionId = getSessionId();
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
          sessionId,
        }),
      });
    } catch {
      // fire and forget
    }
  }, [pathname]);

  return null;
}
