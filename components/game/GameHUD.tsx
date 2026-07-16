"use client";

type GameHUDProps = {
  distance: number;
  collected: number;
  total: number;
  onBack: () => void;
};

export function GameHUD({ distance, collected, total, onBack }: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-4">
      <button
        onClick={onBack}
        className="pointer-events-auto flex items-center gap-1 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        aria-label="Back to portfolio"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className="flex gap-2 sm:gap-3">
        <div className="rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-sm">
          {distance}m
        </div>
        <div className="rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-sm">
          {collected}/{total} ⭐
        </div>
      </div>
    </div>
  );
}
