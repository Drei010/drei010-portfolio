import Matter from "matter-js";
import { Collectible, CollectibleState, CollectibleType } from "./types";
import { getTerrainHeightAtX } from "./terrain";
import { aboutData } from "@/lib/data/about";
import { skillsData } from "@/lib/data/skills";
import { projectsData } from "@/lib/data/projects";
import { contactData } from "@/lib/data/contact";
import { servicesData } from "@/lib/data/services";

const SPAWN_INTERVAL = 600;
const COLLECTIBLE_SIZE = 20;
const FLOAT_OFFSET = 60;

type PortfolioItem = {
  type: CollectibleType;
  title: string;
  content: string;
};

function getPortfolioItems(): PortfolioItem[] {
  const items: PortfolioItem[] = [];

  items.push({
    type: "about",
    title: aboutData.name,
    content: `${aboutData.title} — ${aboutData.bio}`,
  });

  for (const category of skillsData) {
    items.push({
      type: "skills",
      title: category.name,
      content: category.skills.join(", "),
    });
  }

  for (const project of projectsData) {
    items.push({
      type: "projects",
      title: project.title,
      content: project.description,
    });
  }

  for (const service of servicesData) {
    items.push({
      type: "services",
      title: service.title,
      content: service.description,
    });
  }

  items.push({
    type: "contact",
    title: "Contact",
    content: `${contactData.email} — ${contactData.links.map((l) => l.platform).join(", ")}`,
  });

  return items;
}

let portfolioItems: PortfolioItem[] | null = null;

function getItems(): PortfolioItem[] {
  if (!portfolioItems) {
    portfolioItems = getPortfolioItems();
  }
  return portfolioItems;
}

export function createCollectibleState(): CollectibleState {
  return {
    items: [],
    collectedCount: 0,
    collectedDataIndices: [],
    totalSpawned: 0,
    lastSpawnX: 200,
  };
}

export function spawnCollectibles(
  state: CollectibleState,
  cameraX: number,
  canvasWidth: number,
  terrainSeed: number,
  world: Matter.World
): CollectibleState {
  const spawnAhead = cameraX + canvasWidth * 2;
  if (state.lastSpawnX >= spawnAhead) return state;

  let { items, totalSpawned, lastSpawnX } = state;
  const allItems = getItems();
  const collectedIndices = new Set(state.collectedDataIndices);
  const activeIndices = new Set(items.map((item) => item.dataIndex));
  let modified = false;

  while (lastSpawnX < spawnAhead) {
    const dataIndex = allItems.findIndex(
      (_, index) => !collectedIndices.has(index) && !activeIndices.has(index)
    );
    if (dataIndex === -1) break;

    lastSpawnX = Math.max(lastSpawnX + SPAWN_INTERVAL, cameraX + canvasWidth);
    const item = allItems[dataIndex];
    const terrainY = getTerrainHeightAtX(lastSpawnX, terrainSeed);
    const y = terrainY - FLOAT_OFFSET;
    const id = `collectible-${dataIndex}-${totalSpawned}`;
    const body = Matter.Bodies.circle(lastSpawnX, y, COLLECTIBLE_SIZE, {
      isSensor: true,
      isStatic: true,
      label: id,
    });

    Matter.Composite.add(world, body);
    items = [
      ...items,
      {
        id,
        body,
        type: item.type,
        dataIndex,
        collected: false,
        x: lastSpawnX,
        y,
      },
    ];
    activeIndices.add(dataIndex);
    totalSpawned += 1;
    modified = true;
  }

  return modified
    ? { ...state, items, totalSpawned, lastSpawnX }
    : state;
}

export function removeOffscreenCollectibles(
  state: CollectibleState,
  cameraX: number,
  world: Matter.World
): CollectibleState {
  const removeDistance = cameraX - 1000;
  const toRemove = state.items.filter((item) => item.x < removeDistance);
  if (toRemove.length === 0) return state;

  for (const item of toRemove) {
    Matter.Composite.remove(world, item.body);
  }

  return {
    ...state,
    items: state.items.filter((item) => item.x >= removeDistance),
  };
}

export function getTotalCollectibleCount(): number {
  return getItems().length;
}

export function getPortfolioItemByIndex(index: number): PortfolioItem {
  const items = getItems();
  return items[index % items.length];
}

const PICKUP_RADIUS = 50;

export function checkCollectiblePickups(
  state: CollectibleState,
  vehicleX: number,
  vehicleY: number,
  world: Matter.World
): { state: CollectibleState; collectedItems: Collectible[] } {
  const collectedItems: Collectible[] = [];
  let modified = false;

  const items = state.items.map((item) => {
    if (item.collected) return item;

    const dx = vehicleX - item.x;
    const dy = vehicleY - item.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < PICKUP_RADIUS) {
      Matter.Composite.remove(world, item.body);
      collectedItems.push(item);
      modified = true;
      return { ...item, collected: true };
    }
    return item;
  });

  if (!modified) {
    return { state, collectedItems: [] };
  }

  const collectedDataIndices = Array.from(
    new Set([
      ...state.collectedDataIndices,
      ...collectedItems.map((item) => item.dataIndex),
    ])
  );

  return {
    state: {
      ...state,
      items,
      collectedDataIndices,
      collectedCount: collectedDataIndices.length,
    },
    collectedItems,
  };
}
