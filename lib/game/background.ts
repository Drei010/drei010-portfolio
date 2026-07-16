import { CameraState, CloudShape } from "./types";

const CLOUD_COUNT = 12;

let clouds: CloudShape[] | null = null;

function initClouds(canvasWidth: number): CloudShape[] {
  const result: CloudShape[] = [];
  for (let i = 0; i < CLOUD_COUNT; i++) {
    result.push({
      x: Math.random() * canvasWidth * 4 - canvasWidth,
      y: 30 + Math.random() * 150,
      width: 80 + Math.random() * 120,
      height: 30 + Math.random() * 30,
      speed: 0.1 + Math.random() * 0.2,
      opacity: 0.3 + Math.random() * 0.4,
    });
  }
  return result;
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  camera: CameraState
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#0ea5e9");
  gradient.addColorStop(0.4, "#7dd3fc");
  gradient.addColorStop(0.7, "#bae6fd");
  gradient.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!clouds) {
    clouds = initClouds(canvasWidth);
  }

  for (const cloud of clouds) {
    const parallaxX = (cloud.x - camera.x * cloud.speed * 0.3) % (canvasWidth * 3);
    const adjustedX = parallaxX < -200 ? parallaxX + canvasWidth * 3 : parallaxX;

    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = "#ffffff";
    drawCloud(ctx, adjustedX, cloud.y, cloud.width, cloud.height);
    ctx.restore();
  }
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, width * 0.5, height * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x - width * 0.3, y + height * 0.1, width * 0.3, height * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + width * 0.3, y + height * 0.05, width * 0.35, height * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + width * 0.1, y - height * 0.2, width * 0.25, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function resetClouds(): void {
  clouds = null;
}
