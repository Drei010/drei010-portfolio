import { CameraState, CloudShape } from "./types";

const CLOUD_COUNT = 12;

let clouds: CloudShape[] | null = null;
let sky: { ctx: CanvasRenderingContext2D; height: number; gradient: CanvasGradient } | null = null;
let hills: Path2D[] | null = null;

function getHills(): Path2D[] {
  if (hills) return hills;
  hills = [0, 1].map(layer => {
    const path = new Path2D();
    path.moveTo(0, 250);
    for (let x = 0; x <= 1600; x += 20) {
      path.lineTo(x, 80 + Math.sin(x * Math.PI / 400) * (layer ? 36 : 55) + Math.sin(x * Math.PI / 200) * 15);
    }
    path.lineTo(1600, 250);
    path.closePath();
    return path;
  });
  return hills;
}

function initClouds(canvasWidth: number): CloudShape[] {
  const result: CloudShape[] = [];
  for (let i = 0; i < CLOUD_COUNT; i++) {
    result.push({
      x: (i * 397) % (canvasWidth * 3),
      y: 60 + (i * 73) % 150,
      width: 80 + (i * 41) % 120,
      height: 30 + (i * 13) % 30,
      speed: 0.1 + (i % 3) * 0.1,
      opacity: 0.3 + (i % 4) * 0.1,
    });
  }
  return result;
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  camera: CameraState,
  reducedMotion = false
): void {
  if (!sky || sky.height !== canvasHeight || sky.ctx !== ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#66bad0");
    gradient.addColorStop(0.65, "#d1e6db");
    gradient.addColorStop(1, "#f5dfb7");
    sky = { ctx, height: canvasHeight, gradient };
  }
  ctx.fillStyle = sky.gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!clouds) {
    clouds = initClouds(canvasWidth);
  }

  for (const cloud of clouds) {
    const parallaxX = (cloud.x - (reducedMotion ? 0 : camera.x) * cloud.speed * 0.3) % (canvasWidth * 3);
    const adjustedX = parallaxX < -200 ? parallaxX + canvasWidth * 3 : parallaxX;

    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = "#ffffff";
    drawCloud(ctx, adjustedX, cloud.y, cloud.width, cloud.height);
    ctx.restore();
  }
  getHills().forEach((path, layer) => {
    const offset = reducedMotion ? 0 : ((camera.x * (layer ? 0.13 : 0.06)) % 1600 + 1600) % 1600;
    ctx.fillStyle = layer ? "#84b9ad" : "#a6c8bd";
    for (let x = -1600; x < canvasWidth + 1600; x += 1600) {
      ctx.save();
      ctx.translate(x - offset, canvasHeight * (canvasHeight > canvasWidth ? 0.34 : 0.48));
      ctx.fill(path);
      ctx.restore();
    }
  });
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
  sky = null;
}
