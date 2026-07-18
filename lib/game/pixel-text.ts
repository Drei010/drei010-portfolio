type PixelGlyph = readonly string[];

const PIXEL_GLYPHS: Readonly<Record<string, PixelGlyph>> = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
};

const UNKNOWN_GLYPH: PixelGlyph = [
  "11111",
  "10001",
  "00010",
  "00100",
  "00100",
  "00000",
  "00100",
];
const LETTER_SPACING = 1;

function getGlyph(character: string): PixelGlyph {
  return PIXEL_GLYPHS[character.toUpperCase()] ?? UNKNOWN_GLYPH;
}

export function measurePixelText(text: string, scale: number): number {
  return Array.from(text).reduce((width, character, index) => {
    const glyphWidth = getGlyph(character)[0].length * scale;
    const spacing = index === text.length - 1 ? 0 : LETTER_SPACING * scale;
    return width + glyphWidth + spacing;
  }, 0);
}

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  top: number,
  scale: number,
  color: string
): void {
  let cursorX = Math.round(centerX - measurePixelText(text, scale) / 2);
  const pixelTop = Math.round(top);

  ctx.fillStyle = color;

  for (const character of text) {
    const glyph = getGlyph(character);

    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] === "1") {
          ctx.fillRect(cursorX + column * scale, pixelTop + row * scale, scale, scale);
        }
      }
    }

    cursorX += (glyph[0].length + LETTER_SPACING) * scale;
  }
}
