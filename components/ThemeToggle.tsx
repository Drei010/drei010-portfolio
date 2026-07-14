"use client";

import { useTheme } from "@/lib/theme-context";
import { useView } from "@/lib/view-context";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { view } = useView();

  if (view === "cli") return null;

  // Before mount, render the "light" state to match server HTML.
  // After mount, use the real theme value.
  const isDark = mounted ? theme === "dark" : false;

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className="relative flex h-8 w-14 items-center rounded-full border border-border bg-surface-alt p-0.5 transition-colors duration-200 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
    >
      {/* Sliding indicator */}
      <span
        className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
        aria-hidden="true"
      >
        {isDark ? (
          <MoonIcon className="h-3.5 w-3.5 text-background" />
        ) : (
          <SunIcon className="h-3.5 w-3.5 text-background" />
        )}
      </span>

      {/* Background icons */}
      <span className="flex w-full items-center justify-between px-1.5" aria-hidden="true">
        <SunIcon className={`h-3 w-3 transition-opacity duration-200 ${isDark ? "opacity-40" : "opacity-0"}`} />
        <MoonIcon className={`h-3 w-3 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-40"}`} />
      </span>
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
