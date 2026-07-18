export const FIXED_PHYSICS_STEP_MS = 1000 / 60;
export const MAX_PHYSICS_STEPS_PER_FRAME = 3;

const MAX_FRAME_DELTA_MS =
  FIXED_PHYSICS_STEP_MS * MAX_PHYSICS_STEPS_PER_FRAME;
const FLOATING_POINT_TOLERANCE = 0.000001;

export type FixedStepBatch = {
  steps: number;
  remainder: number;
};

export function consumeFixedSteps(
  accumulator: number,
  frameDelta: number
): FixedStepBatch {
  const clampedDelta = Math.min(Math.max(frameDelta, 0), MAX_FRAME_DELTA_MS);
  const total = accumulator + clampedDelta;
  const availableSteps = Math.floor(
    (total + FLOATING_POINT_TOLERANCE) / FIXED_PHYSICS_STEP_MS
  );
  const steps = Math.min(availableSteps, MAX_PHYSICS_STEPS_PER_FRAME);
  let remainder = total - steps * FIXED_PHYSICS_STEP_MS;

  if (steps === MAX_PHYSICS_STEPS_PER_FRAME) {
    remainder = Math.min(remainder, FIXED_PHYSICS_STEP_MS);
  }

  return {
    steps,
    remainder: Math.max(0, remainder),
  };
}
