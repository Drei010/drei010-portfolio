import assert from "node:assert/strict";
import { loadTypeScriptModule } from "./ts-module-loader.mjs";

const theme = loadTypeScriptModule("lib/theme-config.ts");
const autocomplete = loadTypeScriptModule("lib/cli/autocomplete.ts");
const ai = loadTypeScriptModule("lib/cli/ai-adapter.ts");
const { contactData } = loadTypeScriptModule("lib/data/contact.ts");
const { VEHICLE_CONFIG } = loadTypeScriptModule("lib/game/config.ts");
const camera = loadTypeScriptModule("lib/game/camera.ts");
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test("validates theme values and time-based defaults", () => {
  assert.equal(theme.isThemeMode("light"), true);
  assert.equal(theme.isThemeMode("dark"), true);
  assert.equal(theme.isThemeMode("system"), false);
  assert.equal(theme.getThemeForHour(5), "dark");
  assert.equal(theme.getThemeForHour(12), "light");
  assert.equal(theme.getThemeForHour(19), "dark");
});

test("rejects malformed, expired, and future theme storage", () => {
  const now = 2_000_000_000_000;
  assert.equal(theme.resolveStoredTheme("dark", String(now - 1000), now), "dark");
  assert.equal(theme.resolveStoredTheme("invalid", String(now - 1000), now), null);
  assert.equal(theme.resolveStoredTheme("light", "not-a-number", now), null);
  assert.equal(
    theme.resolveStoredTheme(
      "light",
      String(now - theme.THEME_EXPIRY_MS),
      now
    ),
    null
  );
  assert.equal(theme.resolveStoredTheme("dark", String(now + 1000), now), null);
});

test("keeps CLI autocomplete deterministic", () => {
  assert.equal(autocomplete.getCompletion("pro"), "projects");
  assert.equal(autocomplete.getCompletion("  THE"), "theme");
  assert.equal(autocomplete.getCompletion(""), null);
  assert.equal(autocomplete.getCompletion("unknown"), null);
});

test("derives CLI contact answers from canonical contact data", async () => {
  const response = await ai.queryAI("How can I contact you?");
  assert.ok(response.includes(contactData.email));
  for (const link of contactData.links) {
    assert.ok(response.includes(link.platform));
  }
  assert.equal(response.includes("hello@andreikyle.dev"), false);
});

test("keeps canonical vehicle performance values and total mass", () => {
  assert.equal(VEHICLE_CONFIG.maxSpeed, 14);
  assert.equal(VEHICLE_CONFIG.driveForce, 0.07);
  assert.equal(VEHICLE_CONFIG.brakeForce, 0.05);
  assert.equal(
    VEHICLE_CONFIG.chassisMass + VEHICLE_CONFIG.wheelMass * 2,
    30
  );
});


test("keeps camera smoothing isolated per game state", () => {
  const movingVehicle = {
    body: { position: { x: 100, y: 100 }, velocity: { x: 10 } },
  };
  const stationaryVehicle = {
    body: { position: { x: 100, y: 100 }, velocity: { x: 0 } },
  };
  const updatedMoving = camera.updateCamera(
    camera.createCameraState(),
    movingVehicle,
    800,
    600
  );
  const updatedStationary = camera.updateCamera(
    camera.createCameraState(),
    stationaryVehicle,
    800,
    600
  );
  assert.ok(updatedMoving.smoothedVelocityX > 0);
  assert.equal(updatedStationary.smoothedVelocityX, 0);
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

if (failures > 0) {
  console.error(`\n${failures} repository test${failures === 1 ? "" : "s"} failed.`);
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} repository tests passed.`);
}
