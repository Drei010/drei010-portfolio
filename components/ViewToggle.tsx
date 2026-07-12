"use client";

import { useView } from "@/lib/view-context";

export function ViewToggle() {
  const { view, toggleView, cliCardVisible } = useView();

  const isHidden = view === "web" && cliCardVisible;

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isHidden ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-32 opacity-100"
      }`}
    >
      <button
        onClick={toggleView}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-mono transition-colors duration-200 hover:border-primary hover:text-primary"
        aria-label={`Switch to ${view === "web" ? "CLI" : "Web"} view`}
        aria-hidden={isHidden}
        tabIndex={isHidden ? -1 : 0}
      >
        {view === "web" ? (
          <>
            <TerminalIcon />
            <span className="hidden sm:inline">CLI</span>
          </>
        ) : (
          <>
            <GlobeIcon />
            <span className="hidden sm:inline">Web</span>
          </>
        )}
      </button>
    </div>
  );
}

function TerminalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
