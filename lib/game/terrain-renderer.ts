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

  // Draw smooth terrain using quadratic bezier curves
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);

  // Use smooth curve interpolation between vertices
  for (let i = 0; i < allVertices.length - 1; i++) {
    const current = allVertices[i];
    const next = allVertices[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }

  // Connect to last vertex
  const last = allVertices[allVertices.length - 1];
  ctx.lineTo(last.x, last.y);

  // Close path at bottom
  ctx.lineTo(last.x, canvasHeight + 200);
  ctx.lineTo(allVertices[0].x, canvasHeight + 200);
  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, BASE_HEIGHT - 100, 0, BASE_HEIGHT + 200);
  gradient.addColorStop(0, "#22c55e");
  gradient.addColorStop(0.4, "#16a34a");
  gradient.addColorStop(0.7, "#15803d");
  gradient.addColorStop(1, "#14532d");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Smooth surface line
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);
  for (let i = 0; i < allVertices.length - 1; i++) {
    const current = allVertices[i];
    const next = allVertices[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  ctx.lineTo(last.x, last.y);
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Surface highlight
  ctx.beginPath();
  ctx.moveTo(allVertices[0].x, allVertices[0].y);
  for (let i = 0; i < allVertices.length - 1; i++) {
    const current = allVertices[i];
    const next = allVertices[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  ctx.lineTo(last.x, last.y);
  ctx.strokeStyle = "rgba(134, 239, 172, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
