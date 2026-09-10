export function getCanvasBuffer(width: number, height: number, dpr: number) {
  const scale = Math.min(Math.max(1, dpr || 1), 2, Math.sqrt(3_000_000 / Math.max(1, width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), scale };
}
