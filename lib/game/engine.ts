import Matter from "matter-js";
import { GameState, ControlsState, CloudInfo } from "./types";
import {
  createVehicle,
  addVehicleToWorld,
  applyGas,
  applyBrake,
  stabilizeSuspension,
  isVehicleGrounded,
  updateAirControl,
} from "./vehicle";
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
import { drawPixelText, measurePixelText } from "./pixel-text";
import { GAME_START_POSITION } from "./config";

const VEHICLE_START_X = GAME_START_POSITION.x;
const VEHICLE_START_Y = GAME_START_POSITION.y;

export function initGameState(): GameState {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
    positionIterations: 8,
    velocityIterations: 6,
    constraintIterations: 6,
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
    stabilizeSuspension(state.vehicle);
    updateAirControl(
      state.vehicle,
      controls,
      isVehicleGrounded(state.engine, state.vehicle),
      delta
    );
  }

  const vehicle = state.vehicle;

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
        cloudInfos,
        canvasHeight
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
  renderCloudInfos(ctx, state.cloudInfos, state.camera, canvasHeight);

  // Show instructions as static hero text in the clouds before game starts
  if (!state.started) {
    renderInstructions(ctx, canvasWidth, canvasHeight, time);
  }

  // Apply camera transform for world-space rendering
  applyCameraTransform(ctx, state.camera);

  // Terrain
  renderTerrain(ctx, state.terrain.chunks);

  // Collectibles
  renderCollectibles(ctx, state.collectibles.items, time);

  // Vehicle
  renderVehicle(ctx, state.vehicle);

  // Reset transform
  resetCameraTransform(ctx);
}

function fillSteppedPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x + step, y, width - step * 2, height);
  ctx.fillRect(x, y + step, width, height - step * 2);
}

function renderInstructions(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const compact = canvasHeight < 430;
  const panelWidth = Math.min(720, canvasWidth - 24);
  const panelHeight = Math.min(compact ? 190 : 232, canvasHeight - 24);
  const centerX = Math.round(canvasWidth / 2);
  const centerY = Math.round(
    Math.max(panelHeight / 2 + 12, canvasHeight * (compact ? 0.35 : 0.34))
  );
  const panelLeft = Math.round(centerX - panelWidth / 2);
  const panelTop = Math.round(centerY - panelHeight / 2);
  const panelStep = 8;
  const titleWidthAtUnitScale = measurePixelText("HILL ROLL", 1);
  const pixelScale = Math.max(
    2,
    Math.min(compact ? 6 : 7, Math.floor((panelWidth - 48) / titleWidthAtUnitScale))
  );
  const lineHeight = 7 * pixelScale;
  const titleTop = panelTop + (compact ? 18 : 30);
  const secondLineTop = titleTop + lineHeight + pixelScale;
  const subtitleY = secondLineTop + lineHeight + (compact ? 13 : 18);
  const controlsY = subtitleY + (compact ? 23 : 28);
  const promptY = controlsY + (compact ? 22 : 28);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  fillSteppedPanel(
    ctx,
    panelLeft + 7,
    panelTop + 7,
    panelWidth,
    panelHeight,
    panelStep,
    "rgba(0, 0, 0, 0.35)"
  );
  fillSteppedPanel(
    ctx,
    panelLeft,
    panelTop,
    panelWidth,
    panelHeight,
    panelStep,
    "#f97316"
  );
  fillSteppedPanel(
    ctx,
    panelLeft + 3,
    panelTop + 3,
    panelWidth - 6,
    panelHeight - 6,
    panelStep - 3,
    "rgba(13, 13, 13, 0.92)"
  );

  ctx.fillStyle = "#fb923c";
  ctx.fillRect(panelLeft + 14, panelTop + 14, 5, 5);
  ctx.fillRect(panelLeft + panelWidth - 19, panelTop + 14, 5, 5);
  ctx.fillRect(panelLeft + 14, panelTop + panelHeight - 19, 5, 5);
  ctx.fillRect(panelLeft + panelWidth - 19, panelTop + panelHeight - 19, 5, 5);

  if (!compact) {
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#a3541a";
    ctx.fillText("// GAME MODE 01 //", centerX, panelTop + 15);
  }

  for (const [line, top] of [
    ["HILL ROLL", titleTop],
    ["PORTFOLIO", secondLineTop],
  ] as const) {
    drawPixelText(
      ctx,
      line,
      centerX + pixelScale * 2,
      top + pixelScale * 2,
      pixelScale,
      "#090909"
    );
    drawPixelText(
      ctx,
      line,
      centerX + pixelScale,
      top + pixelScale,
      pixelScale,
      "#9a3412"
    );
    drawPixelText(ctx, line, centerX, top, pixelScale, "#f97316");
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${compact ? 12 : 14}px monospace`;
  ctx.fillStyle = "#ededed";
  ctx.fillText("DRIVE · COLLECT · EXPLORE THE PORTFOLIO", centerX, subtitleY);

  ctx.font = `bold ${compact ? 13 : 15}px monospace`;
  ctx.fillStyle = "#f97316";
  ctx.fillText("←  BRAKE       GAS  →", centerX, controlsY);

  ctx.globalAlpha = 0.65 + Math.sin(time * 0.005) * 0.35;
  ctx.font = `bold ${compact ? 10 : 12}px monospace`;
  ctx.fillStyle = "#fb923c";
  ctx.fillText("[ PRESS ANY CONTROL TO START ]", centerX, promptY);

  ctx.restore();
}

export function cleanupGame(state: GameState): void {
  Matter.Engine.clear(state.engine);
  resetClouds();
}
