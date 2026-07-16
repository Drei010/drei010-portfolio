import { ControlsState } from "./types";

export function createControlsState(): ControlsState {
  return {
    gasPressed: false,
    brakePressed: false,
  };
}

export function setupKeyboardControls(
  setState: (updater: (prev: ControlsState) => ControlsState) => void
): () => void {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      setState((prev) => ({ ...prev, gasPressed: true }));
    }
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      setState((prev) => ({ ...prev, brakePressed: true }));
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      setState((prev) => ({ ...prev, gasPressed: false }));
    }
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      setState((prev) => ({ ...prev, brakePressed: false }));
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}
