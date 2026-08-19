import { test, expect, type Page } from "@playwright/test";

async function goToHome(page: Page) {
  await page.goto("/");
  await page.getByRole("heading", { name: "Andrei Kyle Hidalgo" }).waitFor({ state: "visible" });
  // Let the hero entrance animation (framer-motion fade/slide) finish.
  await page.waitForTimeout(500);
}

test.describe("Portfolio views screenshots", () => {
  test("captures web view", async ({ page }) => {
    await goToHome(page);
    await page.screenshot({ path: "e2e/screenshots/web-view.png", fullPage: true });
  });

  test("captures CLI view", async ({ page }) => {
    await goToHome(page);
    await page.getByRole("main").getByRole("button", { name: "Switch to CLI view" }).click();
    await page.getByLabel("Terminal command input").waitFor({ state: "visible" });
    await page.screenshot({ path: "e2e/screenshots/cli-view.png", fullPage: true });
  });

  test("captures game view", async ({ page }) => {
    await goToHome(page);
    await page.getByRole("main").getByRole("button", { name: "Switch to game view" }).click();
    await expect(page.getByRole("main").getByRole("button", { name: "Switch to game view" })).toHaveCount(0);
    await page.locator("canvas").first().waitFor({ state: "visible" });
    await page.screenshot({ path: "e2e/screenshots/game-view.png", fullPage: true });
  });
});
