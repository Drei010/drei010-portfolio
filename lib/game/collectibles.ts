import Matter from "matter-js";
import type { Collectible, CollectibleState, PortfolioItem } from "./types";
import { getTerrainHeightAtX } from "./terrain";
import { portfolioItems } from "./portfolio";

export function createCollectibleState(): CollectibleState {
  return { items: [], collectedCount: 0, collectedDataIndices: [], totalSpawned: 0, lastSpawnX: 0 };
}

export function spawnCollectibles(state: CollectibleState, cameraX: number, visibleWidth: number, seed: number, world: Matter.World): CollectibleState {
  // One destination at a time guarantees chapter order and respawns missed items.
  if (state.items.some(item => !item.collected)) return state;
  const dataIndex = portfolioItems.findIndex((_, index) => !state.collectedDataIndices.includes(index));
  if (dataIndex === -1) return state;
  const x = Math.max(state.lastSpawnX + 1100, cameraX + visibleWidth * 0.85);
  const y = getTerrainHeightAtX(x, seed) - 60;
  const id = `collectible-${dataIndex}-${state.totalSpawned}`;
  const body = Matter.Bodies.circle(x, y, 20, { isSensor: true, isStatic: true, label: id });
  Matter.Composite.add(world, body);
  const item: Collectible = { id, body, type: portfolioItems[dataIndex].type, dataIndex, collected: false, x, y };
  return { ...state, items: [...state.items.filter(item => !item.collected), item], lastSpawnX: x, totalSpawned: state.totalSpawned + 1 };
}

export function removeOffscreenCollectibles(state: CollectibleState, cameraX: number, world: Matter.World): CollectibleState {
  const expired = state.items.filter(item => item.collected || item.x < cameraX - 100);
  if (!expired.length) return state;
  for (const item of expired) Matter.Composite.remove(world, item.body);
  return { ...state, items: state.items.filter(item => !expired.includes(item)) };
}

export function getTotalCollectibleCount(): number { return portfolioItems.length; }
export function getPortfolioItemByIndex(index: number): PortfolioItem { return portfolioItems[index % portfolioItems.length]; }

export function checkCollectiblePickups(state: CollectibleState, x: number, y: number, world: Matter.World): { state: CollectibleState; collectedItems: Collectible[] } {
  const collectedItems = state.items.filter(item => !item.collected && Math.hypot(x - item.x, y - item.y) < 70);
  if (!collectedItems.length) return { state, collectedItems };
  for (const item of collectedItems) Matter.Composite.remove(world, item.body);
  const collectedDataIndices = [...new Set([...state.collectedDataIndices, ...collectedItems.map(item => item.dataIndex)])];
  return { state: { ...state, items: state.items.map(item => collectedItems.includes(item) ? { ...item, collected: true } : item), collectedDataIndices, collectedCount: collectedDataIndices.length }, collectedItems };
}
