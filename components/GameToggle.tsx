"use client";

import { useView } from "@/lib/view-context";

export function GameToggle() {
  const { view, setView, gameCardVisible } = useView();

  const isHidden = view === "web" && gameCardVisible;

  function handleClick() {
    if (view === "game") {
      setView("cli");
    } else {
      setView("game");
    }
  }

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isHidden ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-32 opacity-100"
      }`}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-mono transition-colors duration-200 hover:border-primary hover:text-primary"
        aria-label={view === "game" ? "Switch to CLI mode" : "Play portfolio game"}
        aria-hidden={isHidden}
        tabIndex={isHidden ? -1 : 0}
      >
        {view === "game" ? (
          <>
            <TerminalIcon />
            <span className="hidden sm:inline">CLI</span>
          </>
        ) : (
          <>
            <GamepadIcon />
            <span className="hidden sm:inline">Play</span>
          </>
        )}
      </button>
    </div>
  );
}

function GamepadIcon() {
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
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
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
