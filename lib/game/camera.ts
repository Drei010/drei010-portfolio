import { CameraState, VehicleState } from "./types";

const LERP_SPEED_X = 0.04;
const LERP_SPEED_Y = 0.025;
const LOOKAHEAD_X = 120;
const OFFSET_Y = -50;

// Zoom scales the whole world-space render (terrain, vehicle, collectibles).
// Smaller screens zoom out (lower value) so more of the world — and more of
// the vertical hill range — stays visible instead of being cropped.
const REFERENCE_HEIGHT = 720;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1;

export function getCameraZoom(canvasHeight: number): number {
  if (canvasHeight <= 0) return MAX_ZOOM;
  const raw = canvasHeight / REFERENCE_HEIGHT;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, raw));
}

export function createCameraState(): CameraState {
  return {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothedVelocityX: 0,
    zoom: MAX_ZOOM,
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

  const smoothedVelocityX =
    camera.smoothedVelocityX +
    (velocityX - camera.smoothedVelocityX) * 0.05;

  const zoom = getCameraZoom(canvasHeight);
  // Visible world-space area is the canvas size divided by zoom — zooming
  // out (zoom < 1) grows the visible world area beyond the raw canvas size.
  const visibleWidth = canvasWidth / zoom;
  const visibleHeight = canvasHeight / zoom;

  const lookahead = Math.min(Math.max(smoothedVelocityX * 8, 0), LOOKAHEAD_X);
  const targetX = vehicleX + lookahead - visibleWidth * 0.35;
  const targetY = vehicleY + OFFSET_Y - visibleHeight * 0.65;

  // Snap to target on first frame so the vehicle is immediately visible
  const firstFrame = camera.x === 0 && camera.y === 0 && camera.targetX === 0 && camera.targetY === 0;

  const newX = firstFrame ? targetX : camera.x + (targetX - camera.x) * LERP_SPEED_X;
  const newY = firstFrame ? targetY : camera.y + (targetY - camera.y) * LERP_SPEED_Y;

  return {
    x: newX,
    y: newY,
    targetX,
    targetY,
    smoothedVelocityX,
    zoom,
  };
}

export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: CameraState
): void {
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
}

export function resetCameraTransform(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
