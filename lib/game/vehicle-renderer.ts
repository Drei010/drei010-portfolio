import { VehicleState } from "./types";
import { VEHICLE_CONFIG, VEHICLE_RENDER_CONFIG } from "./config";

const {
  carWidth: CAR_WIDTH,
  carHeight: CAR_HEIGHT,
  wheelRadius: WHEEL_RADIUS,
} = VEHICLE_RENDER_CONFIG;
const PHYSICS_WHEEL_OFFSET_X = VEHICLE_CONFIG.wheelOffsetX;

let carImage: HTMLImageElement | null = null;
let imageReady = false;

export function prepareVehicleImage(onReady: () => void): () => void {
  loadCarImage();
  const image = carImage!;
  if (imageReady) onReady();
  image.addEventListener("load", onReady);
  return () => image.removeEventListener("load", onReady);
}

function loadCarImage(): void {
  if (carImage) return;
  carImage = new Image();
  carImage.src = "/car-game.webp";
  carImage.onload = () => {
    imageReady = true;
  };
}

function getChassisAnchor(
  body: VehicleState["body"],
  horizontalOffset: number
): { x: number; y: number } {
  const cosine = Math.cos(body.angle);
  const sine = Math.sin(body.angle);
  return {
    x: body.position.x + horizontalOffset * cosine,
    y: body.position.y + horizontalOffset * sine,
  };
}

function renderSuspensionLink(
  ctx: CanvasRenderingContext2D,
  body: VehicleState["body"],
  wheel: VehicleState["wheelFront"],
  horizontalOffset: number
): void {
  const anchor = getChassisAnchor(body, horizontalOffset);
  ctx.save();
  ctx.strokeStyle = "rgba(30, 41, 59, 0.75)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(wheel.position.x, wheel.position.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(249, 115, 22, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function renderVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleState
): void {
  if (!carImage) {
    loadCarImage();
  }

  const { body, wheelFront, wheelRear } = vehicle;

  renderSuspensionLink(ctx, body, wheelFront, PHYSICS_WHEEL_OFFSET_X);
  renderSuspensionLink(ctx, body, wheelRear, -PHYSICS_WHEEL_OFFSET_X);

  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  if (imageReady && carImage) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      carImage,
      -CAR_WIDTH / 2,
      -CAR_HEIGHT / 2,
      CAR_WIDTH,
      CAR_HEIGHT
    );
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT, 6);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  renderWheel(ctx, wheelFront);
  renderWheel(ctx, wheelRear);
}

function renderWheel(
  ctx: CanvasRenderingContext2D,
  wheel: VehicleState["wheelFront"]
): void {
  ctx.save();
  ctx.translate(wheel.position.x, wheel.position.y);
  ctx.rotate(wheel.angle);

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
