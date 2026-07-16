import Matter from "matter-js";
import { GameState, ControlsState, CloudInfo } from "./types";
import { createVehicle, addVehicleToWorld, applyGas, applyBrake, updateWheelVisualAngle } from "./vehicle";
import { renderVehicle } from "./vehicle-renderer";
import { createTerrainState, updateTerrain } from "./terrain";
import { renderTerrain } from "./terrain-renderer";
import { createCameraState, updateCamera, applyCameraTransform, resetCameraTransform } from "./camera";
import { renderBackground, resetClouds } from "./background";
import {
  createCollectibleState,
  spawnCollectibles,
  removeOffscreenCollectibles,
  getPortfolioItemByIndex,
  checkCollectiblePickups,
} from "./collectibles";
import { renderCollectibles } from "./collectibles-renderer";
import { createCloudInfo, updateCloudInfos, renderCloudInfos } from "./cloud-info";

const VEHICLE_START_X = 100;
const VEHICLE_START_Y = 509;

export function initGameState(): GameState {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
    positionIterations: 6,
    velocityIterations: 4,
    constraintIterations: 2,
  });

  const vehicle = createVehicle(VEHICLE_START_X, VEHICLE_START_Y);
  addVehicleToWorld(engine.world, vehicle);

  const terrain = createTerrainState();
  const camera = createCameraState();
  const collectibles = createCollectibleState();

  return {
    engine,
    vehicle,
    terrain,
    camera,
    collectibles,
    cloudInfos: [],
    controls: { gasPressed: false, brakePressed: false },
    distance: 0,
    score: 0,
    running: true,
    started: false,
  };
}

export function updateGame(
  state: GameState,
  controls: ControlsState,
  canvasWidth: number,
  canvasHeight: number,
  delta: number
): GameState {
  if (!state.running) return state;

  // Only apply controls and physics when game has started
  if (state.started) {
    if (controls.gasPressed) {
      applyGas(state.vehicle);
    }
    if (controls.brakePressed) {
      applyBrake(state.vehicle);
    }
    Matter.Engine.update(state.engine, delta);
  }

  // Update visual wheel rotation
  const vehicle = updateWheelVisualAngle(state.vehicle);

  // Update camera
  const camera = updateCamera(state.camera, vehicle, canvasWidth, canvasHeight);

  // Update terrain
  const terrain = updateTerrain(state.terrain, camera.x, state.engine.world);

  // Spawn and clean collectibles
  let collectibles = spawnCollectibles(
    state.collectibles,
    camera.x,
    canvasWidth,
    terrain.seed,
    state.engine.world
  );
  collectibles = removeOffscreenCollectibles(collectibles, camera.x, state.engine.world);

  // Check for collectible pickups (distance-based, reliable with compound bodies)
  let cloudInfos = [...state.cloudInfos];
  let score = state.score;
  if (state.started) {
    const pickupResult = checkCollectiblePickups(
      collectibles,
      vehicle.body.position.x,
      vehicle.body.position.y,
      state.engine.world
    );
    collectibles = pickupResult.state;

    // Create cloud info cards for each collected item
    for (const collected of pickupResult.collectedItems) {
      const portfolioItem = getPortfolioItemByIndex(collected.dataIndex);
      const cloudInfo: CloudInfo = createCloudInfo(
        collected.type,
        portfolioItem.title,
        portfolioItem.content,
        camera.x,
        canvasWidth,
        cloudInfos
      );
      cloudInfos.push(cloudInfo);
      score += 10;
    }
  }

  // Update cloud infos
  cloudInfos = updateCloudInfos(cloudInfos);

  // Calculate distance
  const distance = Math.max(0, Math.floor((vehicle.body.position.x - VEHICLE_START_X) / 10));

  return {
    ...state,
    vehicle,
    camera,
    terrain,
    collectibles,
    cloudInfos,
    distance,
    score,
    controls,
  };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  // Clear
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background (screen-space, no camera transform)
  renderBackground(ctx, canvasWidth, canvasHeight, state.camera);

  // Cloud infos (screen-space, rendered in background area)
  renderCloudInfos(ctx, state.cloudInfos, state.camera);

  // Show instructions as static hero text in the clouds before game starts
  if (!state.started) {
    renderInstructions(ctx, canvasWidth, canvasHeight);
  }

  // Apply camera transform for world-space rendering
  applyCameraTransform(ctx, state.camera);

  // Terrain
  renderTerrain(ctx, state.terrain.chunks, canvasHeight);

  // Collectibles
  renderCollectibles(ctx, state.collectibles.items, time);

  // Vehicle
  renderVehicle(ctx, state.vehicle);

  // Reset transform
  resetCameraTransform(ctx);
}

function renderInstructions(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight * 0.35;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Dark backdrop behind text for contrast
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.roundRect(centerX - 320, centerY - 80, 640, 180, 16);
  ctx.fill();

  // Main title - pixelated style with orange color and dark stroke
  ctx.font = "bold 52px 'Courier New', Courier, monospace";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 5;
  ctx.strokeText("HILL CLIMB PORTFOLIO", centerX, centerY - 35);
  ctx.fillStyle = "#f97316";
  ctx.fillText("HILL CLIMB PORTFOLIO", centerX, centerY - 35);

  // Orange glow on title
  ctx.shadowColor = "#f97316";
  ctx.shadowBlur = 15;
  ctx.fillText("HILL CLIMB PORTFOLIO", centerX, centerY - 35);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Subtitle - white with dark outline
  ctx.font = "bold 18px 'Courier New', Courier, monospace";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 4;
  ctx.strokeText("Drive over hills & collect items to explore the portfolio", centerX, centerY + 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Drive over hills & collect items to explore the portfolio", centerX, centerY + 20);

  // Controls - orange accented
  ctx.font = "bold 20px 'Courier New', Courier, monospace";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 4;
  ctx.strokeText("←  BRAKE        →  GAS", centerX, centerY + 60);
  ctx.fillStyle = "#ea580c";
  ctx.fillText("←  BRAKE        →  GAS", centerX, centerY + 60);

  // "Press to start" blinking effect
  ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
  ctx.font = "14px 'Courier New', Courier, monospace";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 3;
  ctx.strokeText("Press any control to start", centerX, centerY + 95);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Press any control to start", centerX, centerY + 95);

  ctx.restore();
}

export function cleanupGame(state: GameState): void {
  Matter.Engine.clear(state.engine);
  resetClouds();
}
