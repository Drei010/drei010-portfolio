"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

type WebScrollContextValue = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const WebScrollContext = createContext<WebScrollContextValue | null>(null);

export function WebScrollProvider({ children }: { children: ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <WebScrollContext.Provider value={{ scrollContainerRef }}>
      {children}
    </WebScrollContext.Provider>
  );
}

export function useWebScroll(): WebScrollContextValue {
  const context = useContext(WebScrollContext);
  if (!context) {
    throw new Error("useWebScroll must be used within a WebScrollProvider");
  }
  return context;
}
