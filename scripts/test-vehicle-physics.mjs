import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const projectRequire = createRequire(import.meta.url);
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports;

  const source = readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolutePath,
  }).outputText;
  const compiledModule = { exports: {} };
  moduleCache.set(absolutePath, compiledModule);

  function localRequire(specifier) {
    if (!specifier.startsWith(".")) return projectRequire(specifier);
    const dependencyPath = resolve(absolutePath, "..", specifier);
    const withExtension = dependencyPath.endsWith(".ts") ? dependencyPath : `${dependencyPath}.ts`;
    return loadTypeScriptModule(withExtension.slice(projectRoot.length + 1));
  }

  const evaluate = new Function("require", "module", "exports", output);
  evaluate(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

const Matter = projectRequire("matter-js");
const vehicleModule = loadTypeScriptModule("lib/game/vehicle.ts");
const rendererModule = loadTypeScriptModule("lib/game/vehicle-renderer.ts");
const fixedStepModule = loadTypeScriptModule("lib/game/fixed-step.ts");
const STEP_MS = 1000 / 60;
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function allVehicleBodies(vehicle) {
  return [vehicle.body, vehicle.wheelFront, vehicle.wheelRear].filter(Boolean);
}

function createZeroGravityEngine(vehicle) {
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
  vehicleModule.addVehicleToWorld(engine.world, vehicle);
  return engine;
}

function simulateRenderRate(rate) {
  let accumulator = 0;
  let steps = 0;
  for (let frame = 0; frame < rate * 2; frame += 1) {
    const result = fixedStepModule.consumeFixedSteps(accumulator, 1000 / rate);
    accumulator = result.remainder;
    steps += result.steps;
  }
  return steps;
}

function getWheelMountPosition(body, horizontalOffset) {
  const cosine = Math.cos(body.angle);
  const sine = Math.sin(body.angle);
  return {
    x: body.position.x + horizontalOffset * cosine - 20 * sine,
    y: body.position.y + horizontalOffset * sine + 20 * cosine,
  };
}

test("preserves the baseline launch acceleration", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  const engine = createZeroGravityEngine(vehicle);
  vehicleModule.applyGas(vehicle);
  const totalForce = allVehicleBodies(vehicle).reduce(
    (sum, body) => sum + body.force.x,
    0
  );
  assert.ok(Math.abs(totalForce - 0.07) < 0.000001);
  Matter.Engine.update(engine, STEP_MS);
  assert.ok(Math.abs(vehicle.body.velocity.x - 0.64815) < 0.0002);
});

test("uses a three-body, four-constraint assembly with mass 30", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  assert.equal(allVehicleBodies(vehicle).length, 3);
  assert.equal(vehicle.suspensionConstraints.length, 4);
  const totalMass = allVehicleBodies(vehicle).reduce((sum, body) => sum + body.mass, 0);
  assert.ok(Math.abs(totalMass - 30) < 0.0001);
  assert.ok(vehicle.body.collisionFilter.group < 0);
  assert.equal(vehicle.body.collisionFilter.group, vehicle.wheelFront.collisionFilter.group);
  assert.equal(vehicle.body.collisionFilter.group, vehicle.wheelRear.collisionFilter.group);
});

test("renders the chassis and both wheels at their physical world positions", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  Matter.Body.setPosition(vehicle.wheelFront, { x: 137, y: 123 });
  Matter.Body.setPosition(vehicle.wheelRear, { x: 65, y: 118 });
  const translations = [];
  const context = {
    arc() {},
    beginPath() {},
    drawImage() {},
    fill() {},
    lineTo() {},
    moveTo() {},
    restore() {},
    rotate() {},
    roundRect() {},
    save() {},
    scale() {},
    stroke() {},
    translate(x, y) {
      translations.push([x, y]);
    },
  };
  const OriginalImage = globalThis.Image;
  globalThis.Image = class {};

  try {
    rendererModule.renderVehicle(context, vehicle);
  } finally {
    if (OriginalImage) {
      globalThis.Image = OriginalImage;
    } else {
      delete globalThis.Image;
    }
  }

  assert.deepEqual(translations, [
    [vehicle.body.position.x, vehicle.body.position.y],
    [vehicle.wheelFront.position.x, vehicle.wheelFront.position.y],
    [vehicle.wheelRear.position.x, vehicle.wheelRear.position.y],
  ]);
});

test("does not apply more gas at the existing speed limit", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  for (const body of allVehicleBodies(vehicle)) {
    Matter.Body.setVelocity(body, { x: 14, y: 0 });
  }
  vehicleModule.applyGas(vehicle);
  const totalForce = allVehicleBodies(vehicle).reduce((sum, body) => sum + body.force.x, 0);
  assert.equal(totalForce, 0);
});

test("produces identical fixed-step counts at common render rates", () => {
  assert.equal(simulateRenderRate(30), 120);
  assert.equal(simulateRenderRate(60), 120);
  assert.equal(simulateRenderRate(120), 120);

  const halfStep = fixedStepModule.consumeFixedSteps(0, STEP_MS / 2);
  assert.equal(halfStep.steps, 0);
  const completedStep = fixedStepModule.consumeFixedSteps(
    halfStep.remainder,
    STEP_MS / 2
  );
  assert.equal(completedStep.steps, 1);
  assert.ok(completedStep.remainder < 0.000001);

  const stalledFrame = fixedStepModule.consumeFixedSteps(0, 1000);
  assert.equal(stalledFrame.steps, 3);
  assert.ok(stalledFrame.remainder <= STEP_MS);
});

test("preserves brake force and the existing reverse speed limit", () => {
  const brakingVehicle = vehicleModule.createVehicle(100, 100);
  vehicleModule.applyBrake(brakingVehicle);
  const brakingForce = allVehicleBodies(brakingVehicle).reduce(
    (sum, body) => sum + body.force.x,
    0
  );
  assert.ok(Math.abs(brakingForce + 0.05) < 0.000001);

  const limitedVehicle = vehicleModule.createVehicle(100, 100);
  for (const body of allVehicleBodies(limitedVehicle)) {
    Matter.Body.setVelocity(body, { x: -5.61, y: 0 });
  }
  vehicleModule.applyBrake(limitedVehicle);
  const limitedForce = allVehicleBodies(limitedVehicle).reduce(
    (sum, body) => sum + body.force.x,
    0
  );
  assert.equal(limitedForce, 0);
});

test("reports an airborne vehicle as not grounded", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  const engine = createZeroGravityEngine(vehicle);
  Matter.Engine.update(engine, STEP_MS);
  assert.equal(vehicleModule.isVehicleGrounded(engine, vehicle), false);
});

test("keeps suspension attached through a normal landing", () => {
  const vehicle = vehicleModule.createVehicle(100, 70);
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
    constraintIterations: 6,
    positionIterations: 8,
    velocityIterations: 6,
  });
  const ground = Matter.Bodies.rectangle(100, 150, 500, 40, {
    isStatic: true,
    label: "terrain",
    friction: 1,
  });
  vehicleModule.addVehicleToWorld(engine.world, vehicle);
  Matter.Composite.add(engine.world, ground);

  let maximumWheelDistance = 0;
  let minimumSpringLength = Number.POSITIVE_INFINITY;
  let maximumSpringLength = 0;
  const springs = vehicle.suspensionConstraints.filter((constraint) =>
    constraint.label.endsWith("Spring")
  );

  for (let frame = 0; frame < 240; frame += 1) {
    Matter.Engine.update(engine, STEP_MS);
    vehicleModule.stabilizeSuspension(vehicle);
    for (const wheel of [vehicle.wheelFront, vehicle.wheelRear]) {
      maximumWheelDistance = Math.max(
        maximumWheelDistance,
        Matter.Vector.magnitude(Matter.Vector.sub(wheel.position, vehicle.body.position))
      );
    }
    for (const spring of springs) {
      const springLength = Matter.Vector.magnitude(
        Matter.Vector.sub(
          Matter.Constraint.pointAWorld(spring),
          Matter.Constraint.pointBWorld(spring)
        )
      );
      minimumSpringLength = Math.min(minimumSpringLength, springLength);
      maximumSpringLength = Math.max(maximumSpringLength, springLength);
    }
  }

  const suspensionTravel = maximumSpringLength - minimumSpringLength;
  console.log(
    `  suspension travel ${suspensionTravel.toFixed(2)}px, max wheel distance ${maximumWheelDistance.toFixed(2)}px`
  );
  assert.ok(maximumWheelDistance < 48);
  assert.ok(suspensionTravel >= 4 && suspensionTravel <= 12);
  assert.ok(Math.abs(vehicle.body.angularVelocity) < 0.04);
  assert.equal(vehicleModule.isVehicleGrounded(engine, vehicle), true);
});

test("keeps wheels within bounded travel during a high-impact angled landing", () => {
  const vehicle = vehicleModule.createVehicle(100, 55);
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
    constraintIterations: 6,
    positionIterations: 8,
    velocityIterations: 6,
  });
  const ground = Matter.Bodies.rectangle(100, 190, 700, 40, {
    isStatic: true,
    label: "terrain",
    friction: 1,
  });
  Matter.Composite.rotate(vehicle.composite, 0.45, vehicle.body.position);
  for (const body of allVehicleBodies(vehicle)) {
    Matter.Body.setVelocity(body, { x: 6, y: 17 });
  }
  vehicleModule.addVehicleToWorld(engine.world, vehicle);
  Matter.Composite.add(engine.world, ground);

  let maximumMountDisplacement = 0;
  for (let frame = 0; frame < 300; frame += 1) {
    Matter.Engine.update(engine, STEP_MS);
    vehicleModule.stabilizeSuspension(vehicle);
    for (const [wheel, offset] of [
      [vehicle.wheelFront, 34],
      [vehicle.wheelRear, -34],
    ]) {
      const mount = getWheelMountPosition(vehicle.body, offset);
      maximumMountDisplacement = Math.max(
        maximumMountDisplacement,
        Matter.Vector.magnitude(Matter.Vector.sub(wheel.position, mount))
      );
    }
  }

  console.log(
    `  high-impact maximum mount displacement ${maximumMountDisplacement.toFixed(2)}px`
  );
  assert.ok(maximumMountDisplacement <= 12.0001);
});

test("gas and brake provide opposite airborne pitch without linear speed changes", () => {
  const gasVehicle = vehicleModule.createVehicle(100, 100);
  const brakeVehicle = vehicleModule.createVehicle(100, 100);
  const groundedVehicle = vehicleModule.createVehicle(100, 100);
  const gasCapVehicle = vehicleModule.createVehicle(100, 100);
  const brakeCapVehicle = vehicleModule.createVehicle(100, 100);
  vehicleModule.updateAirControl(
    gasVehicle,
    { gasPressed: true, brakePressed: false },
    false,
    STEP_MS
  );
  vehicleModule.updateAirControl(
    brakeVehicle,
    { gasPressed: false, brakePressed: true },
    false,
    STEP_MS
  );
  vehicleModule.updateAirControl(
    groundedVehicle,
    { gasPressed: true, brakePressed: false },
    true,
    STEP_MS
  );
  Matter.Body.setAngularVelocity(gasCapVehicle.body, -0.0848);
  Matter.Body.setAngularVelocity(brakeCapVehicle.body, 0.0848);
  vehicleModule.updateAirControl(
    gasCapVehicle,
    { gasPressed: true, brakePressed: false },
    false,
    STEP_MS
  );
  vehicleModule.updateAirControl(
    brakeCapVehicle,
    { gasPressed: false, brakePressed: true },
    false,
    STEP_MS
  );
  assert.ok(gasVehicle.body.angularVelocity < 0);
  assert.ok(brakeVehicle.body.angularVelocity > 0);
  assert.equal(groundedVehicle.body.angularVelocity, 0);
  assert.ok(Math.abs(gasCapVehicle.body.angularVelocity + 0.085) < 0.000001);
  assert.ok(Math.abs(brakeCapVehicle.body.angularVelocity - 0.085) < 0.000001);
  assert.equal(gasVehicle.body.velocity.x, 0);
  assert.equal(brakeVehicle.body.velocity.x, 0);
});

test("retains the ability to complete a controlled airborne flip", () => {
  const vehicle = vehicleModule.createVehicle(100, 100);
  const engine = createZeroGravityEngine(vehicle);

  for (let frame = 0; frame < 180; frame += 1) {
    Matter.Engine.update(engine, STEP_MS);
    vehicleModule.stabilizeSuspension(vehicle);
    vehicleModule.updateAirControl(
      vehicle,
      { gasPressed: true, brakePressed: false },
      false,
      STEP_MS
    );
  }

  console.log(
    `  controlled air angle ${vehicle.body.angle.toFixed(2)}rad, angular speed ${vehicle.body.angularVelocity.toFixed(3)}`
  );
  assert.ok(vehicle.body.angle < -Math.PI * 2);
  assert.ok(Math.abs(vehicle.body.angularVelocity) <= 0.0850001);
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

if (failures > 0) {
  console.error(`\n${failures} physics test${failures === 1 ? "" : "s"} failed.`);
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} physics tests passed.`);
}
