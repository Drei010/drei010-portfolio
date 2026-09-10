import { test, expect, type Page } from "@playwright/test";
import { portfolioItems } from "../lib/game/portfolio";

async function enterGame(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to game view", exact: true }).click();
  await expect(page.locator(".game-shell")).toHaveAttribute("data-phase", "ready");
  await expect(page.locator("canvas")).toBeVisible();
}

async function count(page: Page) {
  return Number((await page.getByTestId("game-count").innerText()).split("/")[0]);
}

async function checkBounds(page: Page) {
  await expect.poll(() => page.locator("canvas").evaluate(canvas => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, 2, Math.sqrt(3_000_000 / (rect.width * rect.height)));
    return Math.abs((canvas as HTMLCanvasElement).width - Math.floor(rect.width * scale));
  })).toBeLessThanOrEqual(1);
  const dimensions = await page.locator(".game-shell").evaluate(shell => {
    const canvas = shell.querySelector("canvas")!;
    const rect = shell.getBoundingClientRect();
    return { width: rect.width, height: rect.height, innerWidth, innerHeight, scrollWidth: document.documentElement.scrollWidth, pixels: canvas.width * canvas.height, ratio: canvas.width / rect.width, dpr: devicePixelRatio };
  });
  expect(dimensions.width).toBeCloseTo(dimensions.innerWidth, 0);
  expect(dimensions.height).toBeCloseTo(dimensions.innerHeight, 0);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  expect(dimensions.pixels).toBeLessThanOrEqual(3_000_000);
  expect(dimensions.ratio).toBeLessThanOrEqual(2);
  if (dimensions.dpr > 1) expect(dimensions.ratio).toBeGreaterThan(1);
  for (const selector of [".game-hud", ".game-pedals", ".game-discovery"]) {
    const element = page.locator(selector);
    if (!(await element.count())) continue;
    const box = (await element.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(dimensions.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(dimensions.height + 1);
  }
  for (const button of await page.locator(".game-shell button:visible").all()) {
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

test("responsive journey discovers all items, exposes links, completes and replays", async ({ page }, testInfo) => {
  test.setTimeout(100_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await enterGame(page);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.getByText("Rotate Your Device")).toHaveCount(0);
  await checkBounds(page);
  await page.screenshot({ path: testInfo.outputPath("ready.png") });
  await page.keyboard.down("ArrowRight");
  await expect.poll(() => count(page), { timeout: 15000 }).toBeGreaterThan(0);
  await expect(page.getByRole("region", { name: "Latest discovery" })).toBeVisible();
  await checkBounds(page);
  await page.screenshot({ path: testInfo.outputPath("discovery.png") });
  await expect(page.locator(".game-shell")).toHaveAttribute("data-phase", "complete", { timeout: 75000 });
  await page.keyboard.up("ArrowRight");
  await expect(page.getByRole("heading", { name: "You’ve seen the whole road." })).toBeVisible();
  expect(await count(page)).toBe(portfolioItems.length);
  const finishedDistance = await page.getByTestId("game-distance").innerText();
  await page.waitForTimeout(300);
  expect(await page.getByTestId("game-distance").innerText()).toBe(finishedDistance);
  await page.screenshot({ path: testInfo.outputPath("completion.png") });
  await page.getByRole("button", { name: "View discovered projects" }).click();
  for (const project of portfolioItems.filter(item => item.type === "projects")) {
    await page.getByRole("button", { name: new RegExp(project.title) }).click();
    for (const action of project.actions ?? []) await expect(page.getByRole("link", { name: action.label })).toHaveAttribute("href", action.href);
    await page.getByRole("button", { name: "All discoveries" }).click();
  }
  await page.getByRole("button", { name: "Close collection" }).click();
  await expect(page.getByRole("link", { name: "Contact Andrei" })).toHaveAttribute("href", portfolioItems.at(-1)!.actions![0].href);
  await page.getByRole("button", { name: "Replay journey" }).click();
  await expect(page.locator(".game-shell")).toHaveAttribute("data-phase", "ready");
  expect(await count(page)).toBe(0);
  await page.getByRole("button", { name: "Back to portfolio", exact: true }).click();
  await expect(page.locator("header")).toBeVisible();
  expect(errors).toEqual([]);
});

test("resize, touch cancellation, backgrounding and reduced motion preserve a run", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const fill = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function(...args) {
      if (this.canvas.getAttribute("aria-label") === "Hill Climb Racing portfolio game") this.canvas.dataset.draws = String(Number(this.canvas.dataset.draws || 0) + 1);
      return fill.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterGame(page);
  await page.waitForTimeout(500);
  const idleDraws = await page.locator("canvas").getAttribute("data-draws");
  await page.waitForTimeout(250);
  expect(await page.locator("canvas").getAttribute("data-draws")).toBe(idleDraws);
  const gas = page.getByRole("button", { name: "Gas", exact: true });
  const gasBox = (await gas.boundingBox())!;
  await page.mouse.move(gasBox.x + gasBox.width / 2, gasBox.y + gasBox.height / 2);
  await page.mouse.down();
  await expect(page.locator(".game-shell")).toHaveAttribute("data-phase", "playing");
  await page.waitForTimeout(1000);
  await gas.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  const before = await count(page);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.height, height: viewport.width });
  await checkBounds(page);
  expect(await count(page)).toBeGreaterThanOrEqual(before);
  await page.screenshot({ path: testInfo.outputPath("rotated-active.png") });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(150);
  const stopped = await page.getByTestId("game-distance").innerText();
  const stoppedDraws = await page.locator("canvas").getAttribute("data-draws");
  await page.waitForTimeout(300);
  expect(await page.getByTestId("game-distance").innerText()).toBe(stopped);
  expect(await page.locator("canvas").getAttribute("data-draws")).toBe(stoppedDraws);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByRole("button", { name: "Right car" }).click();
  await page.keyboard.down("ArrowRight");
  await expect.poll(() => page.getByTestId("game-distance").innerText()).not.toBe(stopped);
  await page.keyboard.up("ArrowRight");
  expect(errors).toEqual([]);
});

test("game engine is downloaded only on entry", async ({ page }) => {
  const gameScripts: string[] = [];
  const responses: Promise<void>[] = [];
  page.on("response", response => {
    if (response.request().resourceType() === "script") responses.push(response.text().then(body => {
      if (body.includes("matter-js") || body.includes("Matter.js")) gameScripts.push(response.url());
    }).catch(() => {}));
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Andrei Kyle Hidalgo", exact: true })).toBeVisible();
  await page.waitForTimeout(400);
  await Promise.all(responses);
  expect(gameScripts).toEqual([]);
  await page.getByRole("button", { name: "Switch to game view", exact: true }).click();
  await expect(page.locator(".game-shell")).toBeVisible();
  await Promise.all(responses);
  expect(gameScripts.length).toBeGreaterThan(0);
});
