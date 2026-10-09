"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PendingRequestCount = {
  count: number;
  setCount: (count: number) => void;
};

const PendingRequestCountContext = createContext<PendingRequestCount | null>(
  null,
);

/**
 * The NavBar badge count, shared so /settings can push a fresh value after an
 * accept or reject (see PendingRequestCountSync). The NavBar itself fetches
 * only on sign-in, so this is how the badge follows those actions.
 */
export function PendingRequestCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return (
    <PendingRequestCountContext.Provider value={value}>
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
