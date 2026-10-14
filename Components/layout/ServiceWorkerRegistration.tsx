"use client";

import { useEffect } from "react";

/**
 * Registers `public/sw.js`, which only caches hashed static assets and an
 * offline page. Production only: in `next dev` a worker would serve stale
 * assets between reloads.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);

  return null;
}
