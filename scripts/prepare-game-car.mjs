import sharp from "sharp";

// Bake the renderer's existing white-background removal into the shipped sprite.
const { data, info } = await sharp(new URL("../public/car.webp", import.meta.url).pathname).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const minimum = Math.min(data[i], data[i + 1], data[i + 2]);
  if (minimum > 240) data[i + 3] = 0;
  else if (minimum > 220) data[i + 3] = Math.floor(data[i + 3] * 0.3);
}
await sharp(data, { raw: info }).trim().resize(240, 120, { fit: "contain", background: "#00000000" }).webp({ quality: 85 }).toFile(new URL("../public/car-game.webp", import.meta.url).pathname);
