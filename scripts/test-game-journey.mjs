import assert from "node:assert/strict";
import { loadTypeScriptModule, projectRequire } from "./ts-module-loader.mjs";
const Matter = projectRequire("matter-js");
const game = loadTypeScriptModule("lib/game/engine.ts");
const { portfolioItems, CHAPTERS } = loadTypeScriptModule("lib/game/portfolio.ts");
const { getCanvasBuffer } = loadTypeScriptModule("lib/game/viewport.ts");
const camera = loadTypeScriptModule("lib/game/camera.ts");
const terrain = loadTypeScriptModule("lib/game/terrain.ts");
const collectibles = loadTypeScriptModule("lib/game/collectibles.ts");

assert.deepEqual([...new Set(portfolioItems.map(item => item.type))], CHAPTERS);
assert.equal(new Set(portfolioItems.map(item => item.id)).size, portfolioItems.length);
assert.equal(terrain.createTerrainState().seed, terrain.createTerrainState().seed);
for (const [width, height] of [[320, 568], [393, 852], [852, 393], [820, 1180], [1440, 900], [3840, 2160]]) {
  for (const dpr of [1, 2, 3]) {
    const buffer = getCanvasBuffer(width, height, dpr);
    assert.ok(buffer.width * buffer.height <= 3_000_000);
    assert.ok(buffer.scale <= 2);
    assert.ok(buffer.scale > 0);
  }
  const state = game.initGameState();
  const framed = camera.updateCamera(camera.createCameraState(), state.vehicle, width, height);
  const carX = (state.vehicle.body.position.x - framed.x) * framed.zoom;
  const carY = (state.vehicle.body.position.y - framed.y) * framed.zoom;
  assert.ok(carX > width * .2 && carX < width * .4);
  assert.ok(carY > 100 && carY < height - 72);
  assert.ok(width / framed.zoom >= Math.min(width, 800));
  game.cleanupGame(state);
}
console.log("✓ chapter order, stable seed, viewport framing, and pixel budgets");

let state = game.initGameState();
state = game.updateGame(state, state.controls, 820, 1180, 0).state;
const first = state.collectibles.items[0];
state.collectibles = collectibles.removeOffscreenCollectibles(state.collectibles, first.x + 500, state.engine.world);
state.collectibles = collectibles.spawnCollectibles(state.collectibles, first.x + 500, 800, state.terrain.seed, state.engine.world);
assert.equal(state.collectibles.items[0].dataIndex, first.dataIndex);
assert.ok(state.collectibles.items[0].x > first.x);
game.cleanupGame(state);
console.log("✓ missed discoveries respawn ahead without skipping a chapter");

state = game.initGameState();
state = game.updateGame(state, state.controls, 1440, 900, 0).state;
state.phase = "playing";
const discoveries = [];
for (let index = 0; index < portfolioItems.length; index++) {
  const target = state.collectibles.items.find(item => !item.collected);
  assert.ok(target);
  Matter.Composite.translate(state.vehicle.composite, { x: target.x - state.vehicle.body.position.x, y: target.y - state.vehicle.body.position.y });
  for (const body of [state.vehicle.body, state.vehicle.wheelFront, state.vehicle.wheelRear]) Matter.Body.setVelocity(body, { x: 0, y: 0 });
  const result = game.updateGame(state, state.controls, 1440, 900, 1000 / 60);
  state = result.state;
  assert.equal(result.events.length, 1);
  discoveries.push(result.events[0].item.id);
  state = game.updateGame(state, state.controls, 1440, 900, 1000 / 60).state;
}
assert.deepEqual(discoveries, portfolioItems.map(item => item.id));
assert.equal(state.phase, "complete");
const position = { ...state.vehicle.body.position };
assert.deepEqual(game.updateGame(state, { gasPressed: true, brakePressed: false }, 1440, 900, 1000 / 60).events, []);
assert.deepEqual(state.vehicle.body.position, position);
game.cleanupGame(state);
console.log("✓ unique discovery events and final completion stop physics");
