import { CloudInfo, CollectibleType, CameraState } from "./types";
import { getCameraZoom } from "./camera";

const FADE_IN_SPEED = 0.02;
const FADE_OUT_SPEED = 0.015;
const MAX_LIFETIME = 420;
const FLOAT_SPEED = 0.3;
const CARD_WIDTH = 440;
const CARD_SPACING = 20;

// Terrain surface renders at screen Y ≈ TERRAIN_LINE_BASE * zoom + canvasHeight * TERRAIN_LINE_FACTOR
// (derived algebraically from the camera's vertical framing + zoom in camera.ts:
// terrainScreenY = (BASE_HEIGHT - vehicleY - OFFSET_Y) * zoom + canvasHeight * 0.65).
// Popups must stay fully above this line — with margin — on every screen size
// and zoom level, or they render behind the hill fill.
const TERRAIN_LINE_BASE = 91;
const TERRAIN_LINE_FACTOR = 0.65;
const TERRAIN_SAFETY_MARGIN = 40;
// Reserve room for the top HUD overlay so popups never sit under it.
const TOP_SAFE_MARGIN = 56;

function getTerrainLineY(canvasHeight: number): number {
  const zoom = getCameraZoom(canvasHeight);
  return TERRAIN_LINE_BASE * zoom + canvasHeight * TERRAIN_LINE_FACTOR;
}

const PADDING = 24;
const BADGE_HEIGHT = 26;
const BADGE_MARGIN_BOTTOM = 12;
const TITLE_FONT_SIZE = 20;
const TITLE_MARGIN_BOTTOM = 12;
const CONTENT_LINE_HEIGHT = 24;
const CARD_CHROME_HEIGHT =
  PADDING + BADGE_HEIGHT + BADGE_MARGIN_BOTTOM + TITLE_FONT_SIZE + 2 + TITLE_MARGIN_BOTTOM + PADDING;
const FULL_CONTENT_LINES = 8;
const COMPACT_CONTENT_LINES = 5;
const MIN_CARD_SCALE = 0.5;

function cardHeightForLines(lines: number): number {
  return CARD_CHROME_HEIGHT + lines * CONTENT_LINE_HEIGHT;
}

type CloudInfoSizing = {
  scale: number;
  maxContentLines: number;
  cardHeightEstimate: number;
};

// Determines card scale and max content lines from the sky band actually
// available above the terrain line, so popups fit without being cut off or
// rendering behind the hills — correct across every screen size and zoom level.
function getCloudInfoSizing(canvasHeight: number): CloudInfoSizing {
  if (canvasHeight <= 0) {
    return {
      scale: 1,
      maxContentLines: FULL_CONTENT_LINES,
      cardHeightEstimate: cardHeightForLines(FULL_CONTENT_LINES),
    };
  }

  const terrainLineY = getTerrainLineY(canvasHeight);
  const availableBand = terrainLineY - TERRAIN_SAFETY_MARGIN - TOP_SAFE_MARGIN;
  const fullHeight = cardHeightForLines(FULL_CONTENT_LINES);

  if (availableBand >= fullHeight) {
    return { scale: 1, maxContentLines: FULL_CONTENT_LINES, cardHeightEstimate: fullHeight };
  }

  const compactHeight = cardHeightForLines(COMPACT_CONTENT_LINES);
  const scale = Math.max(MIN_CARD_SCALE, Math.min(1, availableBand / compactHeight));

  return {
    scale,
    maxContentLines: COMPACT_CONTENT_LINES,
    cardHeightEstimate: compactHeight * scale,
  };
}

export function getCloudInfoScale(canvasHeight: number): number {
  return getCloudInfoSizing(canvasHeight).scale;
}

function getCardHeightEstimate(canvasHeight: number): number {
  return getCloudInfoSizing(canvasHeight).cardHeightEstimate;
}

export function createCloudInfo(
  type: CollectibleType,
  title: string,
  content: string,
  cameraX: number,
  canvasWidth: number,
  existingInfos?: CloudInfo[],
  canvasHeight?: number
): CloudInfo {
  // Find a non-overlapping position
  const { x, y } = findNonOverlappingPosition(
    cameraX,
    canvasWidth,
    existingInfos ?? [],
    canvasHeight ?? 900
  );

  return {
    id: `cloud-${Date.now()}-${Math.random()}`,
    type,
    title,
    content,
    x,
    y,
    opacity: 0,
    fadeIn: true,
    fadeOut: false,
    lifetime: 0,
    maxLifetime: MAX_LIFETIME,
    scale: 0.5,
  };
}

function findNonOverlappingPosition(
  cameraX: number,
  canvasWidth: number,
  existingInfos: CloudInfo[],
  canvasHeight: number
): { x: number; y: number } {
  const cardHeightEstimate = getCardHeightEstimate(canvasHeight);
  const terrainLineY = getTerrainLineY(canvasHeight);
  // Bottom-most Y a card's top edge can use while keeping its full height
  // above the terrain line (with margin).
  const maxSlotY = Math.max(
    TOP_SAFE_MARGIN,
    terrainLineY - TERRAIN_SAFETY_MARGIN - cardHeightEstimate
  );
  // Distribute slots evenly within the available sky band instead of using
  // fixed absolute pixel values, so they always land above the terrain line.
  const availableBand = Math.max(0, maxSlotY - TOP_SAFE_MARGIN);
  const slotFractions = [0, 0.5, 1, 0.25, 0.75];
  const slotYs = slotFractions.map((f) => TOP_SAFE_MARGIN + availableBand * f);

  const slots = [
    { x: cameraX + canvasWidth * 0.55, y: slotYs[0] },
    { x: cameraX + canvasWidth * 0.75, y: slotYs[1] },
    { x: cameraX + canvasWidth * 0.55, y: slotYs[2] },
    { x: cameraX + canvasWidth * 0.75, y: slotYs[3] },
    { x: cameraX + canvasWidth * 0.65, y: slotYs[4] },
  ];

  // Find the first slot that doesn't overlap with any existing visible popup
  for (const slot of slots) {
    const overlaps = existingInfos.some((info) => {
      if (info.opacity <= 0) return false;
      const dx = Math.abs(slot.x - info.x);
      const dy = Math.abs(slot.y - info.y);
      return dx < CARD_WIDTH + CARD_SPACING && dy < cardHeightEstimate + CARD_SPACING;
    });

    if (!overlaps) {
      return slot;
    }
  }

  // Fallback: use offset position if all slots taken
  return {
    x: cameraX + canvasWidth * 0.55 + existingInfos.length * 60,
    y:
      TOP_SAFE_MARGIN +
      (existingInfos.length % 3) *
        Math.min(cardHeightEstimate + CARD_SPACING, availableBand || cardHeightEstimate),
  };
}

export function updateCloudInfos(infos: CloudInfo[]): CloudInfo[] {
  const updated: CloudInfo[] = [];

  for (const info of infos) {
    let { opacity, fadeIn, fadeOut, lifetime, scale, y } = info;

    lifetime += 1;
    y -= FLOAT_SPEED;

    if (fadeIn) {
      opacity = Math.min(opacity + FADE_IN_SPEED, 0.9);
      scale = Math.min(scale + 0.02, 1);
      if (opacity >= 0.9) {
        fadeIn = false;
      }
    } else if (lifetime > info.maxLifetime * 0.7) {
      fadeOut = true;
      opacity = Math.max(opacity - FADE_OUT_SPEED, 0);
      scale = Math.max(scale - 0.005, 0.8);
    }

    if (fadeOut && opacity <= 0) continue;

    updated.push({ ...info, opacity, fadeIn, fadeOut, lifetime, scale, y });
  }

  return updated;
}

export function renderCloudInfos(
  ctx: CanvasRenderingContext2D,
  infos: CloudInfo[],
  camera: CameraState,
  canvasHeight: number
): void {
  const { scale: sizeScale, maxContentLines } = getCloudInfoSizing(canvasHeight);

  for (const info of infos) {
    const screenX = info.x - camera.x;
    const screenY = info.y;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(screenX, screenY);
    ctx.scale(info.scale * sizeScale, info.scale * sizeScale);
    ctx.globalAlpha = info.opacity;

    const cardWidth = CARD_WIDTH;
    const padding = PADDING;
    const badgeHeight = BADGE_HEIGHT;
    const badgeMarginBottom = BADGE_MARGIN_BOTTOM;
    const titleFontSize = TITLE_FONT_SIZE;
    const titleMarginBottom = TITLE_MARGIN_BOTTOM;
    const contentFontSize = 15;
    const contentLineHeight = CONTENT_LINE_HEIGHT;

    // Measure content to determine card height
    ctx.font = `${contentFontSize}px monospace`;
    const contentMaxWidth = cardWidth - padding * 2;
    const contentLines = wrapText(ctx, info.content, contentMaxWidth, maxContentLines);

    // Calculate total card height with proper padding
    const contentBlockHeight = contentLines.length * contentLineHeight;
    const totalHeight =
      padding +
      badgeHeight +
      badgeMarginBottom +
      titleFontSize + 2 +
      titleMarginBottom +
      contentBlockHeight +
      padding;

    // Draw card background
    const cardX = -cardWidth / 2;
    const cardY = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = getTypeColor(info.type);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, totalHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Current Y cursor for layout (top-down)
    let cursorY = cardY + padding;

    // Type badge
    const badgeWidth = 84;
    ctx.fillStyle = getTypeColor(info.type);
    ctx.beginPath();
    ctx.roundRect(cardX + padding, cursorY, badgeWidth, badgeHeight, 5);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 11px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      info.type.toUpperCase(),
      cardX + padding + badgeWidth / 2,
      cursorY + badgeHeight / 2
    );
    cursorY += badgeHeight + badgeMarginBottom;

    // Title (truncated to fit)
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold ${titleFontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const truncatedTitle = truncateText(ctx, info.title, contentMaxWidth);
    ctx.fillText(truncatedTitle, cardX + padding, cursorY);
    cursorY += titleFontSize + 2 + titleMarginBottom;

    // Content lines
    ctx.fillStyle = "#475569";
    ctx.font = `${contentFontSize}px monospace`;
    ctx.textBaseline = "top";
    for (let i = 0; i < contentLines.length; i++) {
      ctx.fillText(contentLines[i], cardX + padding, cursorY + i * contentLineHeight);
    }

    ctx.restore();
  }
}

function getTypeColor(type: CollectibleType): string {
  switch (type) {
    case "about": return "#fbbf24";
    case "skills": return "#34d399";
    case "projects": return "#a78bfa";
    case "contact": return "#f472b6";
    case "services": return "#38bdf8";
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (lines.length >= maxLines) break;

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    // Check if we still have remaining words — add ellipsis if truncated
    const allWordsUsed = lines.join(" ").split(" ").length + currentLine.split(" ").length >= words.length;
    if (!allWordsUsed) {
      currentLine = currentLine + "...";
    }
    lines.push(currentLine);
  } else if (currentLine && lines.length >= maxLines) {
    // Replace last line's end with ellipsis
    const lastLine = lines[lines.length - 1];
    lines[lines.length - 1] = lastLine.slice(0, -3) + "...";
  }

  return lines;
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  const metrics = ctx.measureText(text);
  if (metrics.width <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    const testMetrics = ctx.measureText(truncated + "...");
    if (testMetrics.width <= maxWidth) {
      return truncated + "...";
    }
  }
  return "...";
}
