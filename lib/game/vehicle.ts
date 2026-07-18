import Matter from "matter-js";
import type { ControlsState, VehicleState } from "./types";
import { FIXED_PHYSICS_STEP_MS } from "./fixed-step";
import { VEHICLE_CONFIG } from "./config";

const {
  chassisWidth: CHASSIS_WIDTH,
  chassisHeight: CHASSIS_HEIGHT,
  wheelRadius: WHEEL_RADIUS,
  wheelOffsetX: WHEEL_OFFSET_X,
  wheelOffsetY: WHEEL_OFFSET_Y,
  chassisMass: CHASSIS_MASS,
  wheelMass: WHEEL_MASS,
  maxSpeed: MAX_SPEED,
  driveForce: DRIVE_FORCE,
  brakeForce: BRAKE_FORCE,
  rotationalStabilityMultiplier: ROTATIONAL_STABILITY_MULTIPLIER,
  springStiffness: SPRING_STIFFNESS,
  springDamping: SPRING_DAMPING,
  locatorStiffness: LOCATOR_STIFFNESS,
  locatorDamping: LOCATOR_DAMPING,
  airPitchAcceleration: AIR_PITCH_ACCELERATION,
  maxControlledAngularSpeed: MAX_CONTROLLED_ANGULAR_SPEED,
  maxSuspensionDisplacement: MAX_SUSPENSION_DISPLACEMENT,
} = VEHICLE_CONFIG;

function createSuspensionConstraints(
  chassis: Matter.Body,
  wheel: Matter.Body,
  horizontalOffset: number
): Matter.Constraint[] {
  const direction = Math.sign(horizontalOffset);
  const spring = Matter.Constraint.create({
    label: `${wheel.label}Spring`,
    bodyA: chassis,
    pointA: { x: horizontalOffset, y: 0 },
    bodyB: wheel,
    length: WHEEL_OFFSET_Y,
    stiffness: SPRING_STIFFNESS,
    damping: SPRING_DAMPING,
  });
  const locatorAnchorX = horizontalOffset - direction * 18;
  const locatorOffsetX = horizontalOffset - locatorAnchorX;
  const locatorOffsetY = WHEEL_OFFSET_Y - 12;
  const locator = Matter.Constraint.create({
    label: `${wheel.label}Locator`,
    bodyA: chassis,
    pointA: { x: locatorAnchorX, y: 12 },
    bodyB: wheel,
    length: Math.hypot(locatorOffsetX, locatorOffsetY),
    stiffness: LOCATOR_STIFFNESS,
    damping: LOCATOR_DAMPING,
  });

  return [spring, locator];
}

function getVehicleBodies(vehicle: VehicleState): Matter.Body[] {
  return [vehicle.body, vehicle.wheelFront, vehicle.wheelRear];
}

function getSuspensionMount(
  body: Matter.Body,
  horizontalOffset: number
): { position: Matter.Vector; velocity: Matter.Vector } {
  const cosine = Math.cos(body.angle);
  const sine = Math.sin(body.angle);
  const rotatedOffset = {
    x: horizontalOffset * cosine - WHEEL_OFFSET_Y * sine,
    y: horizontalOffset * sine + WHEEL_OFFSET_Y * cosine,
  };

  return {
    position: {
      x: body.position.x + rotatedOffset.x,
      y: body.position.y + rotatedOffset.y,
    },
    velocity: {
      x: body.velocity.x - body.angularVelocity * rotatedOffset.y,
      y: body.velocity.y + body.angularVelocity * rotatedOffset.x,
    },
  };
}

function applyDistributedForce(vehicle: VehicleState, forceX: number): void {
  const bodies = getVehicleBodies(vehicle);
  const totalMass = bodies.reduce((sum, body) => sum + body.mass, 0);

  for (const body of bodies) {
    Matter.Body.applyForce(body, body.position, {
      x: forceX * (body.mass / totalMass),
      y: 0,
    });
  }
}

export function createVehicle(x: number, y: number): VehicleState {
  const collisionGroup = Matter.Body.nextGroup(true);
  const collisionFilter = { group: collisionGroup };
  const body = Matter.Bodies.rectangle(x, y, CHASSIS_WIDTH, CHASSIS_HEIGHT, {
    label: "chassis",
    chamfer: { radius: 4 },
    collisionFilter,
    friction: 0.5,
    restitution: 0.05,
    frictionAir: 0.01,
  });
  const wheelFront = Matter.Bodies.circle(
    x + WHEEL_OFFSET_X,
    y + WHEEL_OFFSET_Y,
    WHEEL_RADIUS,
    {
      label: "wheelFront",
      collisionFilter,
      friction: 0.9,
      frictionStatic: 1,
      restitution: 0.05,
      frictionAir: 0.01,
    }
  );
  const wheelRear = Matter.Bodies.circle(
    x - WHEEL_OFFSET_X,
    y + WHEEL_OFFSET_Y,
    WHEEL_RADIUS,
    {
      label: "wheelRear",
      collisionFilter,
      friction: 0.9,
      frictionStatic: 1,
      restitution: 0.05,
      frictionAir: 0.01,
    }
  );

  Matter.Body.setMass(body, CHASSIS_MASS);
  Matter.Body.setInertia(body, body.inertia * ROTATIONAL_STABILITY_MULTIPLIER);
  Matter.Body.setMass(wheelFront, WHEEL_MASS);
  Matter.Body.setMass(wheelRear, WHEEL_MASS);

  const suspensionConstraints = [
    ...createSuspensionConstraints(body, wheelFront, WHEEL_OFFSET_X),
    ...createSuspensionConstraints(body, wheelRear, -WHEEL_OFFSET_X),
  ];
  const composite = Matter.Composite.create({ label: "vehicle" });
  Matter.Composite.add(composite, [
    body,
    wheelFront,
    wheelRear,
    ...suspensionConstraints,
  ]);

  return {
    body,
    wheelFront,
    wheelRear,
    suspensionConstraints,
    composite,
  };
}

export function addVehicleToWorld(
  world: Matter.World,
  vehicle: VehicleState
): void {
  Matter.Composite.add(world, vehicle.composite);
}

export function applyGas(vehicle: VehicleState): void {
  if (vehicle.body.velocity.x < MAX_SPEED) {
    applyDistributedForce(vehicle, DRIVE_FORCE);
  }
}

export function applyBrake(vehicle: VehicleState): void {
  if (vehicle.body.velocity.x > -MAX_SPEED * 0.4) {
    applyDistributedForce(vehicle, -BRAKE_FORCE);
  }
}

export function stabilizeSuspension(vehicle: VehicleState): void {
  for (const [wheel, horizontalOffset] of [
    [vehicle.wheelFront, WHEEL_OFFSET_X],
    [vehicle.wheelRear, -WHEEL_OFFSET_X],
  ] as const) {
    const mount = getSuspensionMount(vehicle.body, horizontalOffset);
    const displacement = Matter.Vector.sub(wheel.position, mount.position);
    const distance = Matter.Vector.magnitude(displacement);
    if (distance <= MAX_SUSPENSION_DISPLACEMENT) continue;

    const direction = Matter.Vector.mult(displacement, 1 / distance);
    Matter.Body.setPosition(wheel, {
      x: mount.position.x + direction.x * MAX_SUSPENSION_DISPLACEMENT,
      y: mount.position.y + direction.y * MAX_SUSPENSION_DISPLACEMENT,
    });

    const relativeVelocity = Matter.Vector.sub(wheel.velocity, mount.velocity);
    const outwardSpeed = Matter.Vector.dot(relativeVelocity, direction);
    if (outwardSpeed > 0) {
      Matter.Body.setVelocity(
        wheel,
        Matter.Vector.sub(
          wheel.velocity,
          Matter.Vector.mult(direction, outwardSpeed)
        )
      );
    }
  }
}

export function isVehicleGrounded(
  engine: Matter.Engine,
  vehicle: VehicleState
): boolean {
  const wheelIds = new Set([vehicle.wheelFront.id, vehicle.wheelRear.id]);

  return engine.pairs.list.some((pair: Matter.Pair) => {
    if (!pair.isActive) return false;
    const firstIsWheel = wheelIds.has(pair.bodyA.id);
    const secondIsWheel = wheelIds.has(pair.bodyB.id);
    const firstIsTerrain = pair.bodyA.label === "terrain";
    const secondIsTerrain = pair.bodyB.label === "terrain";
    return (
      (firstIsWheel && secondIsTerrain) ||
      (secondIsWheel && firstIsTerrain)
    );
  });
}

export function updateAirControl(
  vehicle: VehicleState,
  controls: ControlsState,
  grounded: boolean,
  delta: number
): void {
  if (grounded) return;

  const pitchInput = Number(controls.brakePressed) - Number(controls.gasPressed);
  if (pitchInput === 0) return;

  const frameScale = Math.min(Math.max(delta / FIXED_PHYSICS_STEP_MS, 0), 2);
  const controlledVelocity =
    vehicle.body.angularVelocity +
    pitchInput * AIR_PITCH_ACCELERATION * frameScale;
  const angularVelocity = Math.min(
    Math.max(controlledVelocity, -MAX_CONTROLLED_ANGULAR_SPEED),
    MAX_CONTROLLED_ANGULAR_SPEED
  );
  Matter.Body.setAngularVelocity(vehicle.body, angularVelocity);
}
