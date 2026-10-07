"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type PendingRequestCount = {
  count: number;
  setCount: (count: number) => void;
};

const PendingRequestCountContext = createContext<PendingRequestCount | null>(
  null,
);

/**
 * The NavBar badge count, shared so /settings can push a fresh value after an
 * accept or reject (see PendingRequestCountSync). Without it the NavBar only
 * refetches on navigation, and those actions keep the user on /settings.
 */
export function PendingRequestCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [count, setCount] = useState(0);
  return (
    <PendingRequestCountContext.Provider value={{ count, setCount }}>
      {children}
    </PendingRequestCountContext.Provider>
  );
}

export function usePendingRequestCount(): PendingRequestCount {
  const value = useContext(PendingRequestCountContext);
  if (!value) {
    throw new Error(
      "usePendingRequestCount must be used inside PendingRequestCountProvider.",
    );
  }
  return value;
}
