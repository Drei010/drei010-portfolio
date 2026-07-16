import { CameraState, VehicleState } from "./types";

const LERP_SPEED_X = 0.04;
const LERP_SPEED_Y = 0.025;
const LOOKAHEAD_X = 120;
const OFFSET_Y = -50;

let smoothedVelocityX = 0;

export function createCameraState(): CameraState {
  smoothedVelocityX = 0;
  return {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  };
}

export function updateCamera(
  camera: CameraState,
  vehicle: VehicleState,
  canvasWidth: number,
  canvasHeight: number
): CameraState {
  const vehicleX = vehicle.body.position.x;
  const vehicleY = vehicle.body.position.y;
  const velocityX = vehicle.body.velocity.x;

  // Smooth the velocity to prevent camera jitter from frame-to-frame fluctuations
  smoothedVelocityX += (velocityX - smoothedVelocityX) * 0.05;

  const lookahead = Math.min(Math.max(smoothedVelocityX * 8, 0), LOOKAHEAD_X);
  const targetX = vehicleX + lookahead - canvasWidth * 0.35;
  const targetY = vehicleY + OFFSET_Y - canvasHeight * 0.65;

  // Smooth interpolation with separate X/Y speeds
  const newX = camera.x + (targetX - camera.x) * LERP_SPEED_X;
  const newY = camera.y + (targetY - camera.y) * LERP_SPEED_Y;

  return {
    x: newX,
    y: Math.min(newY, 0),
    targetX,
    targetY,
  };
}

export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: CameraState
): void {
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
}

export function resetCameraTransform(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
