"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ThemeMode } from "@/lib/types";
import {
  THEME_STORAGE_KEY,
  THEME_TIMESTAMP_KEY,
  getThemeForHour,
  resolveStoredTheme,
} from "@/lib/theme-config";


type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getTimezoneDefault(): ThemeMode {
  return getThemeForHour(new Date().getHours());
}

function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const timestamp = localStorage.getItem(THEME_TIMESTAMP_KEY);
    const resolved = resolveStoredTheme(stored, timestamp, Date.now());
    if (resolved) return resolved;
    if (stored || timestamp) {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(THEME_TIMESTAMP_KEY);
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

function getResolvedTheme(): ThemeMode {
  const stored = getStoredTheme();
  if (stored) return stored;
  return getTimezoneDefault();
}

function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    localStorage.setItem(THEME_TIMESTAMP_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

function applyThemeClass(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // On the server, default to "light". On the client, the lazy initializer
  // reads from localStorage — the same source as the inline script in layout.tsx.
  // This ensures React's initial state matches the DOM the script already set.
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return getResolvedTheme();
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyThemeClass(theme);
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("no-transition");
    }, 50);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeClass(mode);
    persistTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyThemeClass(next);
      persistTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
