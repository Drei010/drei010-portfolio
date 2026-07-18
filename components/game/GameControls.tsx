"use client";

import type { PointerEvent } from "react";

type GameControlsProps = {
  onGasStart: () => void;
  onGasEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
};

export function GameControls({
  onGasStart,
  onGasEnd,
  onBrakeStart,
  onBrakeEnd,
}: GameControlsProps) {
  function startControl(
    event: PointerEvent<HTMLButtonElement>,
    onStart: () => void
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    onStart();
  }

  function endControl(
    event: PointerEvent<HTMLButtonElement>,
    onEnd: () => void
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onEnd();
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden justify-between p-4 sm:p-6 [@media(pointer:coarse)]:flex">
      <button
        onPointerDown={(event) => startControl(event, onBrakeStart)}
        onPointerUp={(event) => endControl(event, onBrakeEnd)}
        onPointerCancel={onBrakeEnd}
        onLostPointerCapture={onBrakeEnd}
        onContextMenu={(event) => event.preventDefault()}
        className="pointer-events-auto flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-sm transition-all active:scale-95 active:bg-white/40 sm:h-20 sm:w-20"
        aria-label="Brake"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        onPointerDown={(event) => startControl(event, onGasStart)}
        onPointerUp={(event) => endControl(event, onGasEnd)}
        onPointerCancel={onGasEnd}
        onLostPointerCapture={onGasEnd}
        onContextMenu={(event) => event.preventDefault()}
        className="pointer-events-auto flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-sm transition-all active:scale-95 active:bg-white/40 sm:h-20 sm:w-20"
        aria-label="Gas"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
