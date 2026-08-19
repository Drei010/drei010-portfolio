import { test, expect } from "@playwright/test";

const MAX_DISTANCE_M = 1000;
const POLL_INTERVAL_MS = 250;
const MAX_TEST_DURATION_MS = 120_000;

test.describe("Game mode playthrough", () => {
  test("drives, collects all collectibles, and stops at 1000m", async ({ page }) => {
    test.setTimeout(150_000);

    await page.goto("/");
    await page.getByRole("heading", { name: "Andrei Kyle Hidalgo" }).waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    await page.getByRole("main").getByRole("button", { name: "Switch to game view" }).click();
    await expect(page.getByRole("main").getByRole("button", { name: "Switch to game view" })).toHaveCount(0);

    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    const hud = page.locator("text=/\\d+m/").first();
    await hud.waitFor({ state: "visible" });
    const total = await getTotalCollectibles(page);
    expect(total).toBeGreaterThan(0);

    // Focus the canvas and start driving — holding gas also starts the game
    // (state.started flips on first control press).
    await canvas.click();
    await page.keyboard.down("ArrowRight");

    const startTime = Date.now();
    let distance = 0;
    let collected = 0;

    while (Date.now() - startTime < MAX_TEST_DURATION_MS) {
      await page.waitForTimeout(POLL_INTERVAL_MS);
      const stats = await readHudStats(page);
      distance = stats.distance;
      collected = stats.collected;

      if (collected >= total) break;
      if (distance >= MAX_DISTANCE_M) break;
    }

    await page.keyboard.up("ArrowRight");

    await page.screenshot({ path: "e2e/screenshots/gameplay/final-state.png" });

    expect(distance).toBeLessThanOrEqual(MAX_DISTANCE_M + 50);
    if (collected >= total) {
      expect(collected).toBe(total);
    } else {
      expect(distance).toBeGreaterThanOrEqual(MAX_DISTANCE_M);
    }
  });
});

async function getTotalCollectibles(page: import("@playwright/test").Page): Promise<number> {
  const text = await page.locator("text=/\\d+\\/\\d+/").first().textContent();
  const match = text?.match(/(\d+)\/(\d+)/);
  return match ? Number(match[2]) : 0;
}

async function readHudStats(
  page: import("@playwright/test").Page
): Promise<{ distance: number; collected: number }> {
  const distanceText = await page.locator("text=/\\d+m/").first().textContent();
  const countText = await page.locator("text=/\\d+\\/\\d+/").first().textContent();
  const distanceMatch = distanceText?.match(/(\d+)m/);
  const countMatch = countText?.match(/(\d+)\/(\d+)/);
  return {
    distance: distanceMatch ? Number(distanceMatch[1]) : 0,
    collected: countMatch ? Number(countMatch[1]) : 0,
  };
}
