"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { GameState, ControlsState } from "@/lib/game/types";
import { initGameState, updateGame, renderGame, cleanupGame } from "@/lib/game/engine";
import { setupKeyboardControls } from "@/lib/game/controls";
import { getTotalCollectibleCount } from "@/lib/game/collectibles";
import {
  consumeFixedSteps,
  FIXED_PHYSICS_STEP_MS,
} from "@/lib/game/fixed-step";
import { GameControls } from "./GameControls";
import { GameHUD } from "./GameHUD";
import { useView } from "@/lib/view-context";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const controlsRef = useRef<ControlsState>({ gasPressed: false, brakePressed: false });
  const startedRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const [distance, setDistance] = useState(0);
  const [collected, setCollected] = useState(0);
  const totalItems = useMemo(() => getTotalCollectibleCount(), []);
  const [isPortrait, setIsPortrait] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const { setView } = useView();

  // Detect portrait orientation on mobile
  useEffect(() => {
    function checkOrientation() {
      const isMobile = window.innerWidth < 1024;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && portrait);
    }

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    // Try to lock to landscape (works in fullscreen on supported browsers)
    const orientation = screen.orientation as ScreenOrientation & { lock?: (type: string) => Promise<void>; unlock?: () => void };
    if (orientation && orientation.lock) {
      orientation.lock("landscape").catch(() => {
        // Silently fail — lock only works in fullscreen on most browsers
      });
    }

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      // Unlock orientation when leaving game
      const orient = screen.orientation as ScreenOrientation & { unlock?: () => void };
      if (orient && orient.unlock) {
        orient.unlock();
      }
    };
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = width;
    canvas.height = height;
    setCanvasSize({ width, height });
  }, []);

  const setControls = useCallback((updater: (prev: ControlsState) => ControlsState) => {
    controlsRef.current = updater(controlsRef.current);
    if (!startedRef.current) {
      startedRef.current = true;
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const state = initGameState();
    gameStateRef.current = state;

    const cleanupKeyboard = setupKeyboardControls(setControls);

    const handleVisibility = () => {
      if (gameStateRef.current) {
        gameStateRef.current.running = !document.hidden;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cleanupKeyboard();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (gameStateRef.current) {
        cleanupGame(gameStateRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setControls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = 0;
    let accumulator = 0;

    function gameLoop(time: number) {
      if (!gameStateRef.current || !ctx || !canvas) return;

      const frameDelta =
        lastTime === 0 ? FIXED_PHYSICS_STEP_MS : time - lastTime;
      lastTime = time;

      if (gameStateRef.current.running) {
        const stepBatch = consumeFixedSteps(accumulator, frameDelta);
        accumulator = stepBatch.remainder;

        let state = gameStateRef.current;
        state.started = startedRef.current;

        for (let step = 0; step < stepBatch.steps; step += 1) {
          state = updateGame(
            state,
            controlsRef.current,
            canvas.width,
            canvas.height,
            FIXED_PHYSICS_STEP_MS
          );
        }

        gameStateRef.current = state;
        renderGame(ctx, state, canvas.width, canvas.height, time);
        setDistance(state.distance);
        setCollected(state.collectibles.collectedCount);
      } else {
        accumulator = 0;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasSize]);

  const handleGasStart = useCallback(() => {
    controlsRef.current = { ...controlsRef.current, gasPressed: true };
    if (!startedRef.current) {
      startedRef.current = true;
    }
  }, []);

  const handleGasEnd = useCallback(() => {
    controlsRef.current = { ...controlsRef.current, gasPressed: false };
  }, []);

  const handleBrakeStart = useCallback(() => {
    controlsRef.current = { ...controlsRef.current, brakePressed: true };
    if (!startedRef.current) {
      startedRef.current = true;
    }
  }, []);

  const handleBrakeEnd = useCallback(() => {
    controlsRef.current = { ...controlsRef.current, brakePressed: false };
  }, []);

  const handleBack = useCallback(() => {
    setView("web");
  }, [setView]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-sky-900 p-6 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 animate-pulse"
            aria-hidden="true"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
          <p className="text-lg font-bold text-white">Rotate Your Device</p>
          <p className="mt-2 text-sm text-white/70">
            This game is best played in landscape mode.
            Please rotate your device to continue.
          </p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Hill Climb Racing portfolio game"
      />

      <GameHUD
        distance={distance}
        collected={collected}
        total={totalItems}
        onBack={handleBack}
      />

      <GameControls
        onGasStart={handleGasStart}
        onGasEnd={handleGasEnd}
        onBrakeStart={handleBrakeStart}
        onBrakeEnd={handleBrakeEnd}
      />
    </div>
  );
}
