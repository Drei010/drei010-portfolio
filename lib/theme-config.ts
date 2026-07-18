import type { ThemeMode } from "@/lib/types";

export const THEME_STORAGE_KEY = "theme";
export const THEME_TIMESTAMP_KEY = "theme-timestamp";

export const THEME_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getThemeForHour(hour: number): ThemeMode {
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function resolveStoredTheme(
  storedTheme: string | null,
  storedTimestamp: string | null,
  now: number
): ThemeMode | null {
  if (!isThemeMode(storedTheme) || !storedTimestamp) return null;
  const timestamp = Number(storedTimestamp);
  const elapsed = now - timestamp;
  if (!Number.isFinite(timestamp) || elapsed < 0 || elapsed >= THEME_EXPIRY_MS) {
    return null;
  }
  return storedTheme;
}
