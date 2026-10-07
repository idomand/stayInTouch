"use client";

import { useEffect } from "react";
import { usePendingRequestCount } from "@/lib/PendingRequestCountContext";

/**
 * Pushes the server's pending-request count into the NavBar badge. Rendered by
 * /settings, which re-renders after every action that revalidates it, so the
 * badge follows accepts and rejects without each caller updating it.
 */
export default function PendingRequestCountSync({ count }: { count: number }) {
  const { setCount } = usePendingRequestCount();
  useEffect(() => {
    setCount(count);
  }, [count, setCount]);
  return null;
}
