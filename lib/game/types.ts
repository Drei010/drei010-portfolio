import Matter from "matter-js";

export type GameState = {
  engine: Matter.Engine;
  vehicle: VehicleState;
  terrain: TerrainState;
  camera: CameraState;
  collectibles: CollectibleState;
  cloudInfos: CloudInfo[];
  controls: ControlsState;
  distance: number;
  score: number;
  running: boolean;
  started: boolean;
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

export type CloudInfo = {
  id: string;
  type: CollectibleType;
  title: string;
  content: string;
  x: number;
  y: number;
  opacity: number;
  fadeIn: boolean;
  fadeOut: boolean;
  lifetime: number;
  maxLifetime: number;
  scale: number;
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
