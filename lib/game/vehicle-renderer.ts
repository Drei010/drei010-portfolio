import { VehicleState } from "./types";

const CAR_WIDTH = 120;
const CAR_HEIGHT = 60;
const WHEEL_RADIUS = 14;
const WHEEL_FRONT_X = 32;
const WHEEL_REAR_X = -32;
const WHEEL_Y = 18;

let carImage: HTMLImageElement | null = null;
let processedCanvas: HTMLCanvasElement | null = null;
let imageReady = false;

function loadCarImage(): void {
  if (carImage) return;
  carImage = new Image();
  carImage.src = "/car.png";
  carImage.onload = () => {
    // Process image to remove white background
    processedCanvas = document.createElement("canvas");
    processedCanvas.width = carImage!.naturalWidth;
    processedCanvas.height = carImage!.naturalHeight;
    const offCtx = processedCanvas.getContext("2d");
    if (!offCtx) return;

    offCtx.drawImage(carImage!, 0, 0);
    const imageData = offCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;

    // Make white and near-white pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // If pixel is white or near-white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
      // Fade near-white pixels for smoother edges
      else if (r > 220 && g > 220 && b > 220) {
        data[i + 3] = Math.floor(data[i + 3] * 0.3);
      }
    }

    offCtx.putImageData(imageData, 0, 0);
    imageReady = true;
  };
}

export function renderVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleState
): void {
  if (!carImage) {
    loadCarImage();
  }

  const { body, wheelVisualAngle } = vehicle;
  const { x, y } = body.position;
  const angle = body.angle;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Draw car image first (bottom layer)
  if (imageReady && processedCanvas) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      processedCanvas,
      -CAR_WIDTH / 2,
      -CAR_HEIGHT / 2,
      CAR_WIDTH,
      CAR_HEIGHT
    );
    ctx.scale(-1, 1);
  } else {
    // Fallback while image loads
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT, 6);
    ctx.fill();
    ctx.stroke();
  }

  // Draw wheels on top of the car body
  renderWheel(ctx, WHEEL_FRONT_X, WHEEL_Y, wheelVisualAngle);
  renderWheel(ctx, WHEEL_REAR_X, WHEEL_Y, wheelVisualAngle);

  ctx.restore();
}

function renderWheel(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  angle: number
): void {
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.rotate(angle);

  // Tire
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Rim
  ctx.fillStyle = "#666666";
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_RADIUS * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Hub
  ctx.fillStyle = "#999999";
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_RADIUS * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Spokes (show rotation)
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const spokeAngle = (Math.PI / 2) * i;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(spokeAngle) * WHEEL_RADIUS * 0.2,
      Math.sin(spokeAngle) * WHEEL_RADIUS * 0.2
    );
    ctx.lineTo(
      Math.cos(spokeAngle) * WHEEL_RADIUS * 0.5,
      Math.sin(spokeAngle) * WHEEL_RADIUS * 0.5
    );
    ctx.stroke();
  }

  ctx.restore();
}
