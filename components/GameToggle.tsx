"use client";

import { useView } from "@/lib/view-context";

export function GameToggle() {
  const { view, setView } = useView();

  function handleClick() {
    if (view === "game") {
      setView("web");
    } else {
      setView("game");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="ml-3 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-mono transition-colors duration-200 hover:border-primary hover:text-primary"
      aria-label={view === "game" ? "Exit game mode" : "Play portfolio game"}
    >
      {view === "game" ? (
        <>
          <ExitIcon />
          <span className="hidden sm:inline">Exit</span>
        </>
      ) : (
        <>
          <GamepadIcon />
          <span className="hidden sm:inline">Play</span>
        </>
      )}
    </button>
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

function ExitIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
