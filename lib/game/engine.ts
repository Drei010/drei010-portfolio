import Matter from "matter-js";
import type { GameState, ControlsState, GameUpdate } from "./types";
import { createVehicle, addVehicleToWorld, applyGas, applyBrake, stabilizeSuspension, isVehicleGrounded, updateAirControl } from "./vehicle";
import { renderVehicle } from "./vehicle-renderer";
import { createTerrainState, updateTerrain, getTerrainHeightAtX } from "./terrain";
import { renderTerrain } from "./terrain-renderer";
import { createCameraState, updateCamera, applyCameraTransform } from "./camera";
import { renderBackground, resetClouds } from "./background";
import { createCollectibleState, spawnCollectibles, removeOffscreenCollectibles, getPortfolioItemByIndex, checkCollectiblePickups, getTotalCollectibleCount } from "./collectibles";
import { renderCollectibles } from "./collectibles-renderer";
import { GAME_START_POSITION } from "./config";
import { CHAPTER_COLORS, portfolioItems } from "./portfolio";

export function initGameState(): GameState {
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 }, positionIterations: 8, velocityIterations: 6, constraintIterations: 6 });
  const vehicle = createVehicle(GAME_START_POSITION.x, GAME_START_POSITION.y);
  addVehicleToWorld(engine.world, vehicle);
  return { engine, vehicle, terrain: createTerrainState(), camera: createCameraState(), collectibles: createCollectibleState(), controls: { gasPressed: false, brakePressed: false }, distance: 0, phase: "ready" };
}

export function updateGame(state: GameState, controls: ControlsState, width: number, height: number, delta: number): GameUpdate {
  if (state.phase === "complete") return { state, events: [] };
  if (state.phase === "playing") {
    if (controls.gasPressed) applyGas(state.vehicle);
    if (controls.brakePressed) applyBrake(state.vehicle);
    Matter.Engine.update(state.engine, delta);
    stabilizeSuspension(state.vehicle);
    updateAirControl(state.vehicle, controls, isVehicleGrounded(state.engine, state.vehicle), delta);
  }
  const camera = updateCamera(state.camera, state.vehicle, width, height);
  const terrain = updateTerrain(state.terrain, camera.x, state.engine.world, width / camera.zoom);
  let collectibles = removeOffscreenCollectibles(state.collectibles, camera.x, state.engine.world);
  collectibles = spawnCollectibles(collectibles, camera.x, width / camera.zoom, terrain.seed, state.engine.world);
  const pickup = state.phase === "playing"
    ? checkCollectiblePickups(collectibles, state.vehicle.body.position.x, state.vehicle.body.position.y, state.engine.world)
    : { state: collectibles, collectedItems: [] };
  return {
    state: { ...state, camera, terrain, collectibles: pickup.state, controls,
      phase: pickup.state.collectedCount === getTotalCollectibleCount() ? "complete" : state.phase,
      distance: Math.max(0, Math.floor((state.vehicle.body.position.x - GAME_START_POSITION.x) / 10)) },
    events: pickup.collectedItems.map(item => ({ type: "discovery", item: getPortfolioItemByIndex(item.dataIndex) })),
  };
}

export function recoverVehicle(state: GameState): void {
  const x = Math.max(GAME_START_POSITION.x, state.vehicle.body.position.x);
  Matter.Composite.remove(state.engine.world, state.vehicle.composite);
  state.vehicle = createVehicle(x, getTerrainHeightAtX(x, state.terrain.seed) - 60);
  addVehicleToWorld(state.engine.world, state.vehicle);
  state.camera = createCameraState();
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number, time: number, reducedMotion = false): void {
  renderBackground(ctx, width, height, state.camera, reducedMotion);
  ctx.save();
  applyCameraTransform(ctx, state.camera);
  renderTerrain(ctx, state.terrain.chunks, state.camera.y + height / state.camera.zoom);
  for (const item of state.collectibles.items) {
    if (item.collected || (item.dataIndex > 0 && portfolioItems[item.dataIndex - 1].type === item.type)) continue;
    const y = getTerrainHeightAtX(item.x - 100, state.terrain.seed);
    ctx.fillStyle = "#573a27";
    ctx.fillRect(item.x - 102, y - 86, 4, 86);
    ctx.fillStyle = "#201710";
    ctx.fillRect(item.x - 112, y - 94, 118, 30);
    ctx.fillStyle = CHAPTER_COLORS[item.type];
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(item.type.toUpperCase(), item.x - 104, y - 74);
  }
  renderCollectibles(ctx, state.collectibles.items, reducedMotion ? 0 : time);
  renderVehicle(ctx, state.vehicle);
  ctx.restore();
}

export function cleanupGame(state: GameState): void {
  Matter.Composite.clear(state.engine.world, false);
  Matter.Engine.clear(state.engine);
  resetClouds();
}
