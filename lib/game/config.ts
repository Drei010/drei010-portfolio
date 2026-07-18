export const VEHICLE_CONFIG = {
  chassisWidth: 90,
  chassisHeight: 22,
  wheelRadius: 16,
  wheelOffsetX: 34,
  wheelOffsetY: 20,
  chassisMass: 24,
  wheelMass: 3,
  maxSpeed: 14,
  driveForce: 0.07,
  brakeForce: 0.05,
  rotationalStabilityMultiplier: 1.35,
  springStiffness: 0.05,
  springDamping: 0.1,
  locatorStiffness: 0.1,
  locatorDamping: 0.08,
  airPitchAcceleration: 0.0015,
  maxControlledAngularSpeed: 0.085,
  maxSuspensionDisplacement: 12,
} as const;

export const VEHICLE_RENDER_CONFIG = {
  carWidth: 120,
  carHeight: 60,
  wheelRadius: 14,
} as const;

export const GAME_START_POSITION = {
  x: 100,
  y: 509,
} as const;
