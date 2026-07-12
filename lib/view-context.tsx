"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ViewMode } from "@/lib/types";

type ViewContextValue = {
  view: ViewMode;
  toggleView: () => void;
  setView: (mode: ViewMode) => void;
  cliCardVisible: boolean;
  setCliCardVisible: (visible: boolean) => void;
};

const ViewContext = createContext<ViewContextValue | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>("web");
  const [cliCardVisible, setCliCardVisible] = useState(false);

  const toggleView = useCallback(() => {
    setView((prev) => (prev === "web" ? "cli" : "web"));
  }, []);

  return (
    <ViewContext.Provider value={{ view, toggleView, setView, cliCardVisible, setCliCardVisible }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView(): ViewContextValue {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
