import { CloudInfo, CollectibleType, CameraState } from "./types";

const FADE_IN_SPEED = 0.02;
const FADE_OUT_SPEED = 0.015;
const MAX_LIFETIME = 420;
const FLOAT_SPEED = 0.3;
const CARD_WIDTH = 440;
const CARD_HEIGHT_ESTIMATE = 250;
const CARD_SPACING = 20;

export function createCloudInfo(
  type: CollectibleType,
  title: string,
  content: string,
  cameraX: number,
  canvasWidth: number,
  existingInfos?: CloudInfo[]
): CloudInfo {
  // Find a non-overlapping position
  const { x, y } = findNonOverlappingPosition(cameraX, canvasWidth, existingInfos ?? []);

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
  existingInfos: CloudInfo[]
): { x: number; y: number } {
  // Define slots where popups can appear — closer to ground, in front of car
  const slots = [
    { x: cameraX + canvasWidth * 0.55, y: 250 },
    { x: cameraX + canvasWidth * 0.75, y: 250 },
    { x: cameraX + canvasWidth * 0.55, y: 380 },
    { x: cameraX + canvasWidth * 0.75, y: 380 },
    { x: cameraX + canvasWidth * 0.65, y: 315 },
  ];

  // Find the first slot that doesn't overlap with any existing visible popup
  for (const slot of slots) {
    const overlaps = existingInfos.some((info) => {
      if (info.opacity <= 0) return false;
      const dx = Math.abs(slot.x - info.x);
      const dy = Math.abs(slot.y - info.y);
      return dx < CARD_WIDTH + CARD_SPACING && dy < CARD_HEIGHT_ESTIMATE + CARD_SPACING;
    });

    if (!overlaps) {
      return slot;
    }
  }

  // Fallback: use offset position if all slots taken
  return {
    x: cameraX + canvasWidth * 0.55 + existingInfos.length * 60,
    y: 250 + (existingInfos.length % 3) * (CARD_HEIGHT_ESTIMATE + CARD_SPACING),
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
  camera: CameraState
): void {
  for (const info of infos) {
    const screenX = info.x - camera.x;
    const screenY = info.y;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(screenX, screenY);
    ctx.scale(info.scale, info.scale);
    ctx.globalAlpha = info.opacity;

    const cardWidth = 440;
    const padding = 24;
    const badgeHeight = 26;
    const badgeMarginBottom = 12;
    const titleFontSize = 20;
    const titleMarginBottom = 12;
    const contentFontSize = 15;
    const contentLineHeight = 24;
    const maxContentLines = 8;

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
