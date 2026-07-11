"use client";

import { useState, useCallback, useRef } from "react";

export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const indexRef = useRef<number>(-1);

  const add = useCallback((command: string) => {
    setHistory((prev) => [...prev, command]);
  }, []);

  const navigateUp = useCallback((): string | null => {
    if (history.length === 0) return null;
    const newIndex =
      indexRef.current === -1 ? history.length - 1 : Math.max(0, indexRef.current - 1);
    indexRef.current = newIndex;
    return history[newIndex] ?? null;
  }, [history]);

  const navigateDown = useCallback((): string | null => {
    if (history.length === 0 || indexRef.current === -1) return null;
    const newIndex = indexRef.current + 1;
    if (newIndex >= history.length) {
      indexRef.current = -1;
      return null;
    }
    indexRef.current = newIndex;
    return history[newIndex] ?? null;
  }, [history]);

  const resetNavigation = useCallback(() => {
    indexRef.current = -1;
  }, []);

  return { history, add, navigateUp, navigateDown, resetNavigation };
}
