import { TerrainChunk } from "./types";

const BASE_HEIGHT = 550;

export function renderTerrain(
  ctx: CanvasRenderingContext2D,
  chunks: TerrainChunk[],
  canvasHeight: number
): void {
  if (chunks.length === 0) return;

  const allVertices: { x: number; y: number }[] = [];
  for (const chunk of chunks) {
    for (const v of chunk.vertices) {
      if (allVertices.length === 0 || v.x > allVertices[allVertices.length - 1].x) {
        allVertices.push(v);
      }
    }
  }

  if (allVertices.length < 2) return;

  // Fill terrain
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);

  for (let i = 1; i < allVertices.length; i++) {
    ctx.lineTo(allVertices[i].x, allVertices[i].y);
  }

  ctx.lineTo(allVertices[allVertices.length - 1].x, canvasHeight + 200);
  ctx.lineTo(allVertices[0].x, canvasHeight + 200);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, BASE_HEIGHT - 100, 0, BASE_HEIGHT + 200);
  gradient.addColorStop(0, "#22c55e");
  gradient.addColorStop(0.4, "#16a34a");
  gradient.addColorStop(0.7, "#15803d");
  gradient.addColorStop(1, "#14532d");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Terrain surface line
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);
  for (let i = 1; i < allVertices.length; i++) {
    ctx.lineTo(allVertices[i].x, allVertices[i].y);
  }
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Surface highlight
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);
  for (let i = 1; i < allVertices.length; i++) {
    ctx.lineTo(allVertices[i].x, allVertices[i].y);
  }
  ctx.strokeStyle = "rgba(134, 239, 172, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
