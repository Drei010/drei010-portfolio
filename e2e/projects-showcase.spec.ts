import { expect, test } from "@playwright/test";

test.describe("project laptop showcase", () => {
  test("scrubs the laptop and advances project copy", async ({ page }) => {
    test.skip((await page.evaluate(() => window.innerWidth)) < 1024, "desktop showcase only");
    await page.goto("/");
    const scroller = page.locator("[data-web-scroll-container]");
    await page.locator("#projects").evaluate((element) => element.scrollIntoView({ block: "start" }));
    const showcase = page.getByTestId("project-showcase");
    await expect(showcase).toBeVisible();
    await expect(showcase.locator("canvas")).toBeVisible();
    await expect(showcase.locator("video")).toHaveAttribute("src", "/videos/laptop-animation-alpha.webm");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/closed.png" });

    await scroller.evaluate((element) => element.scrollBy(0, 800));
    await page.waitForTimeout(400);
    await expect
      .poll(() => showcase.locator("video").evaluate((video) => (video as HTMLVideoElement).currentTime))
      .toBeGreaterThan(0);
    await expect(showcase.locator("canvas")).toHaveAttribute("data-thumbnail-visible", "false");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/opening.png" });

    for (let step = 0; step < 8; step += 1) {
      await scroller.evaluate((element) => element.scrollBy(0, 700));
      await page.waitForTimeout(150);
      if (await showcase.locator("article").filter({ hasText: "BiteScout" }).getAttribute("aria-hidden") === "false") break;
    }
    await page.waitForTimeout(300);
    await expect(showcase.locator("article").filter({ hasText: "BiteScout" })).toHaveAttribute("aria-hidden", "false");
    await expect(showcase.locator("canvas")).toHaveAttribute("data-thumbnail-visible", "true");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/next-project.png" });

    for (let step = 0; step < 8; step += 1) {
      await scroller.evaluate((element) => element.scrollBy(0, -700));
      await page.waitForTimeout(150);
      if (await showcase.locator("article").filter({ hasText: "RAG Backend" }).getAttribute("aria-hidden") === "false") break;
    }
    await page.waitForTimeout(300);
    await expect(showcase.locator("article").filter({ hasText: "RAG Backend" })).toHaveAttribute("aria-hidden", "false");
  });

  test("fits the thumbnail inside the screen and preserves the notch", async ({ page }) => {
    await page.route("**/projects/rag-backend.svg", (route) => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><path fill="#ff00ff" d="M0 0h1600v1000H0z"/><path fill="#00ff00" d="M400 250h800v500H400z"/></svg>',
    }));
    await page.goto("/");
    const canvas = page.locator(".project-showcase-canvas");
    await page.locator("#projects").evaluate((element) => element.scrollIntoView());
    await page.locator("[data-web-scroll-container]").evaluate((element) => element.scrollBy(0, 1800));
    await expect(canvas).toHaveAttribute("data-thumbnail-visible", "true");
    const colors = await canvas.evaluate((element) => {
      const context = (element as HTMLCanvasElement).getContext("2d")!;
      const ratio = (element as HTMLCanvasElement).width / 1080;
      return [[260, 400], [825, 400], [270, 675], [815, 675], [540, 500], [540, 315], [240, 500]].map(
        ([x, y]) => Array.from(context.getImageData(x * ratio, y * ratio, 1, 1).data).slice(0, 3)
      );
    });
    expect(colors.slice(0, 4)).toEqual(Array(4).fill([255, 0, 255]));
    expect(colors[4]).toEqual([0, 255, 0]);
    expect(colors[5]).not.toEqual([255, 0, 255]);
    expect(colors[6]).not.toEqual([255, 0, 255]);
    await page.screenshot({ path: `e2e/screenshots/projects-showcase/bezel-${test.info().project.name}.png` });
  });

  test("keeps static cards and skips the video on mobile", async ({ page }) => {
    test.skip((await page.evaluate(() => window.innerWidth)) >= 1024, "mobile fallback only");
    await page.goto("/");
    await expect(page.getByTestId("project-showcase")).toBeHidden();
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    await expect(page.locator(".project-showcase-video")).not.toHaveAttribute("src");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/mobile-cards.png" });
  });
});
