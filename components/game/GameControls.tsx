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
    if (event.button !== 0) return;
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
    <div className="game-pedals">
      <button
        onPointerDown={(event) => startControl(event, onBrakeStart)}
        onPointerUp={(event) => endControl(event, onBrakeEnd)}
        onPointerCancel={onBrakeEnd}
        onLostPointerCapture={onBrakeEnd}
        onContextMenu={(event) => event.preventDefault()}
        className="game-pedal"
        onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); onBrakeStart(); } }}
        onKeyUp={event => { if (event.key === " " || event.key === "Enter") onBrakeEnd(); }}
        onBlur={onBrakeEnd}
        aria-label="Brake"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>BRAKE</span>
      </button>

      <button
        onPointerDown={(event) => startControl(event, onGasStart)}
        onPointerUp={(event) => endControl(event, onGasEnd)}
        onPointerCancel={onGasEnd}
        onLostPointerCapture={onGasEnd}
        onContextMenu={(event) => event.preventDefault()}
        className="game-pedal game-gas"
        onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); onGasStart(); } }}
        onKeyUp={event => { if (event.key === " " || event.key === "Enter") onGasEnd(); }}
        onBlur={onGasEnd}
        aria-label="Gas"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>GAS</span>
      </button>
    </div>
  );
}
