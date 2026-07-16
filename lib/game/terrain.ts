import Matter from "matter-js";
import { TerrainChunk, TerrainState } from "./types";

const CHUNK_WIDTH = 800;
const SEGMENT_WIDTH = 40;
const BASE_HEIGHT = 550;
const TERRAIN_DEPTH = 200;
const DIFFICULTY_INTERVAL = 7000; // 700m in world pixels

function getDifficultyMultiplier(x: number): number {
  // Difficulty increases every 7000px (700m)
  // Starts at 1.0, increases by 0.25 each interval, capped at 3.0
  const level = Math.floor(Math.max(0, x - 600) / DIFFICULTY_INTERVAL);
  return Math.min(1.0 + level * 0.25, 3.0);
}

function getFrequencyMultiplier(x: number): number {
  // Frequency slightly increases for steeper/tighter hills
  const level = Math.floor(Math.max(0, x - 600) / DIFFICULTY_INTERVAL);
  return 1.0 + level * 0.1;
}

function noise(x: number, seed: number): number {
  const difficulty = getDifficultyMultiplier(x);
  const freq = getFrequencyMultiplier(x);
  const layer1 = Math.sin(x * 0.005 * freq + seed) * 40 * difficulty;
  const layer2 = Math.sin(x * 0.012 * freq + seed * 2.3) * 20 * difficulty;
  const layer3 = Math.sin(x * 0.025 * freq + seed * 0.7) * 10 * difficulty;
  const layer4 = Math.sin(x * 0.05 * freq + seed * 1.5) * 5 * difficulty;
  return layer1 + layer2 + layer3 + layer4;
}

function getTerrainHeight(x: number, seed: number): number {
  // Completely flat starting zone from x=0 to x=400
  if (x < 400) {
    return BASE_HEIGHT;
  }
  // Smooth transition from flat to hilly between x=400 and x=600
  if (x < 600) {
    const blend = (x - 400) / 200;
    const smoothBlend = blend * blend * (3 - 2 * blend); // smoothstep
    return BASE_HEIGHT + noise(x, seed) * smoothBlend;
  }
  return BASE_HEIGHT + noise(x, seed);
}

export function createTerrainState(): TerrainState {
  return {
    chunks: [],
    lastGeneratedX: -CHUNK_WIDTH,
    seed: Math.random() * 1000,
  };
}

export function generateChunk(
  startX: number,
  seed: number,
  world: Matter.World
): TerrainChunk {
  const vertices: { x: number; y: number }[] = [];
  const bodies: Matter.Body[] = [];

  for (let x = startX; x <= startX + CHUNK_WIDTH; x += SEGMENT_WIDTH) {
    const y = getTerrainHeight(x, seed);
    vertices.push({ x, y });
  }

  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    const midX = (v1.x + v2.x) / 2;
    const midY = (v1.y + v2.y) / 2;

    const segmentVertices = [
      { x: v1.x - midX, y: v1.y - midY },
      { x: v2.x - midX, y: v2.y - midY },
      { x: v2.x - midX, y: v2.y - midY + TERRAIN_DEPTH },
      { x: v1.x - midX, y: v1.y - midY + TERRAIN_DEPTH },
    ];

    const body = Matter.Bodies.fromVertices(midX, midY + TERRAIN_DEPTH / 2, [segmentVertices], {
      isStatic: true,
      friction: 1.0,
      restitution: 0,
      label: "terrain",
    });

    if (body) {
      bodies.push(body);
    }
  }

  Matter.Composite.add(world, bodies);

  return {
    id: `chunk-${startX}`,
    bodies,
    startX,
    endX: startX + CHUNK_WIDTH,
    vertices,
  };
}

export function updateTerrain(
  state: TerrainState,
  cameraX: number,
  world: Matter.World
): TerrainState {
  const generateAhead = cameraX + CHUNK_WIDTH * 3;
  const removeDistance = cameraX - CHUNK_WIDTH * 3;

  let { chunks, lastGeneratedX } = state;
  const { seed } = state;
  let modified = false;

  while (lastGeneratedX < generateAhead) {
    const newStartX = lastGeneratedX + CHUNK_WIDTH;
    const chunk = generateChunk(newStartX, seed, world);
    chunks = [...chunks, chunk];
    lastGeneratedX = newStartX;
    modified = true;
  }

  const chunksToRemove = chunks.filter((c) => c.endX < removeDistance);
  if (chunksToRemove.length > 0) {
    chunksToRemove.forEach((chunk) => {
      chunk.bodies.forEach((body) => {
        Matter.Composite.remove(world, body);
      });
    });
    chunks = chunks.filter((c) => c.endX >= removeDistance);
    modified = true;
  }

  if (modified) {
    return { chunks, lastGeneratedX, seed };
  }
  return state;
}

export function getTerrainHeightAtX(x: number, seed: number): number {
  return getTerrainHeight(x, seed);
}
