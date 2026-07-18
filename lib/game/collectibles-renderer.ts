import { Collectible, CollectibleType } from "./types";

const COLLECTIBLE_SIZE = 20;

export function renderCollectibles(
  ctx: CanvasRenderingContext2D,
  items: Collectible[],
  time: number
): void {
  for (const item of items) {
    if (item.collected) continue;

    const floatY = Math.sin(time * 0.003 + item.x * 0.01) * 6;
    const x = item.body.position.x;
    const y = item.body.position.y + floatY;

    ctx.save();
    ctx.translate(x, y);

    // Glow effect
    ctx.shadowColor = getColor(item.type);
    ctx.shadowBlur = 12;

    // Draw shape based on type
    ctx.fillStyle = getColor(item.type);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    drawShape(ctx, item.type);

    ctx.restore();
  }
}

function getColor(type: CollectibleType): string {
  switch (type) {
    case "about": return "#fbbf24";
    case "skills": return "#34d399";
    case "projects": return "#a78bfa";
    case "contact": return "#f472b6";
    case "services": return "#38bdf8";
  }
}

function drawShape(ctx: CanvasRenderingContext2D, type: CollectibleType): void {
  switch (type) {
    case "about":
      drawDiamond(ctx);
      break;
    case "skills":
      drawHexagon(ctx);
      break;
    case "projects":
      drawStar(ctx);
      break;
    case "contact":
      drawCircleShape(ctx);
      break;
    case "services":
      drawTriangle(ctx);
      break;
  }
}

function drawDiamond(ctx: CanvasRenderingContext2D): void {
  const s = COLLECTIBLE_SIZE;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.7, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHexagon(ctx: CanvasRenderingContext2D): void {
  const s = COLLECTIBLE_SIZE * 0.8;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = Math.cos(angle) * s;
    const py = Math.sin(angle) * s;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawStar(ctx: CanvasRenderingContext2D): void {
  const outerR = COLLECTIBLE_SIZE;
  const innerR = COLLECTIBLE_SIZE * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCircleShape(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.arc(0, 0, COLLECTIBLE_SIZE * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawTriangle(ctx: CanvasRenderingContext2D): void {
  const s = COLLECTIBLE_SIZE;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.87, s * 0.5);
  ctx.lineTo(-s * 0.87, s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
