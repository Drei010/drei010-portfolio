import Matter from "matter-js";
import { VehicleState } from "./types";

const CHASSIS_WIDTH = 80;
const CHASSIS_HEIGHT = 24;
const WHEEL_RADIUS = 16;
const WHEEL_OFFSET_X = 30;
const WHEEL_OFFSET_Y = 18;
const MAX_SPEED = 10;
const DRIVE_FORCE = 0.05;
const BRAKE_FORCE = 0.04;

export function createVehicle(x: number, y: number): VehicleState {
  // Create the chassis as the main body part
  const chassis = Matter.Bodies.rectangle(x, y, CHASSIS_WIDTH, CHASSIS_HEIGHT, {
    label: "chassis",
    chamfer: { radius: 4 },
  });

  // Create wheel shapes as parts of the compound body
  const wheelFront = Matter.Bodies.circle(
    x + WHEEL_OFFSET_X,
    y + WHEEL_OFFSET_Y,
    WHEEL_RADIUS,
    { label: "wheelFront" }
  );

  const wheelRear = Matter.Bodies.circle(
    x - WHEEL_OFFSET_X,
    y + WHEEL_OFFSET_Y,
    WHEEL_RADIUS,
    { label: "wheelRear" }
  );

  // Create a single compound body from all parts
  const body = Matter.Body.create({
    parts: [chassis, wheelFront, wheelRear],
    friction: 0.8,
    frictionStatic: 0.5,
    restitution: 0,
    frictionAir: 0.015,
    label: "vehicle",
  });

  // Explicitly set mass after creation (compound bodies calculate from parts)
  Matter.Body.setMass(body, 30);
  Matter.Body.setPosition(body, { x, y });

  return {
    body,
    wheelVisualAngle: 0,
  };
}

export function addVehicleToWorld(world: Matter.World, vehicle: VehicleState): void {
  Matter.Composite.add(world, vehicle.body);
}

export function applyGas(vehicle: VehicleState): void {
  const speed = vehicle.body.velocity.x;
  if (speed < MAX_SPEED) {
    Matter.Body.applyForce(vehicle.body, vehicle.body.position, {
      x: DRIVE_FORCE,
      y: 0,
    });
  }
}

export function applyBrake(vehicle: VehicleState): void {
  const speed = vehicle.body.velocity.x;
  if (speed > -MAX_SPEED * 0.5) {
    Matter.Body.applyForce(vehicle.body, vehicle.body.position, {
      x: -BRAKE_FORCE,
      y: 0,
    });
  }
}

export function updateWheelVisualAngle(vehicle: VehicleState): VehicleState {
  const velocityX = vehicle.body.velocity.x;
  const angularIncrement = velocityX / WHEEL_RADIUS;
  return {
    ...vehicle,
    wheelVisualAngle: vehicle.wheelVisualAngle + angularIncrement,
  };
}
