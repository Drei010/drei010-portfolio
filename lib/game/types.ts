import type Matter from "matter-js";

export type GamePhase = "ready" | "playing" | "complete";
export type PortfolioItem = {
  id: string;
  type: CollectibleType;
  title: string;
  summary: string;
  actions?: { label: string; href: string }[];
};
export type DiscoveryEvent = { type: "discovery"; item: PortfolioItem };
export type GameUpdate = { state: GameState; events: DiscoveryEvent[] };

export type GameState = {
  engine: Matter.Engine;
  vehicle: VehicleState;
  terrain: TerrainState;
  camera: CameraState;
  collectibles: CollectibleState;
  controls: ControlsState;
  distance: number;
  phase: GamePhase;
};

export type VehicleState = {
  body: Matter.Body;
  wheelFront: Matter.Body;
  wheelRear: Matter.Body;
  suspensionConstraints: Matter.Constraint[];
  composite: Matter.Composite;
};

export type TerrainChunk = {
  id: string;
  bodies: Matter.Body[];
  startX: number;
  endX: number;
  vertices: { x: number; y: number }[];
};

export type TerrainState = {
  chunks: TerrainChunk[];
  lastGeneratedX: number;
  seed: number;
};

export type CameraState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  smoothedVelocityX: number;
  zoom: number;
};

export type CollectibleType = "about" | "skills" | "projects" | "contact" | "services";

export type Collectible = {
  id: string;
  body: Matter.Body;
  type: CollectibleType;
  dataIndex: number;
  collected: boolean;
  x: number;
  y: number;
};

export type CollectibleState = {
  items: Collectible[];
  collectedCount: number;
  collectedDataIndices: number[];
  totalSpawned: number;
  lastSpawnX: number;
};

export type ControlsState = {
  gasPressed: boolean;
  brakePressed: boolean;
};

export type CloudShape = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
};
