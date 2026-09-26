import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("project laptop showcase", () => {
  test("closes and reopens for every project change in both scroll directions", async ({ page }) => {
    test.setTimeout(120_000);
    test.skip((await page.evaluate(() => window.innerWidth)) < 1024, "desktop showcase only");
    await page.goto("/");
    const showcase = page.getByTestId("project-showcase");
    await expect(showcase).toHaveAttribute("data-cache-ready", "true", { timeout: 120_000 });
    const scroller = page.locator("[data-web-scroll-container]");
    await page.locator("#projects").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect(showcase).toBeVisible();
    await expect(showcase.locator("canvas")).toBeVisible();
    await expect(showcase.locator('video[data-active="true"]')).toHaveAttribute("src", "/videos/macbook-air-orbit-scrub.webm");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/closed.png" });

    await scroller.evaluate((element) => element.scrollBy(0, 800));
    await page.waitForTimeout(400);
    await expect.poll(() => showcase.locator("canvas").getAttribute("data-logical-frame").then(Number)).toBeGreaterThan(0);
    await expect(showcase.locator("canvas")).toHaveAttribute("data-thumbnail-visible", "false");
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/opening.png" });

    const readState = () => showcase.evaluate((element) => ({
      frame: Number(element.querySelector("canvas")!.getAttribute("data-logical-frame")),
      visible: element.querySelector("canvas")!.dataset.thumbnailVisible === "true",
      title: element.querySelector('article[aria-hidden="false"] h3')!.textContent,
    }));
    const laptopWidth = () => showcase.locator("canvas").evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width;
      let right = 0;
      for (let pixel = 0; pixel < canvas.width * canvas.height; pixel += 1) {
        if (pixels[pixel * 4 + 3] <= 32) continue;
        const x = pixel % canvas.width;
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
      return right - left + 1;
    });
    const scrollUntil = async (predicate: (state: Awaited<ReturnType<typeof readState>>) => boolean, direction = 1) => {
      for (let step = 0; step < 35; step += 1) {
        if (predicate(await readState())) return;
        await scroller.evaluate((element, delta) => element.scrollBy(0, delta), 180 * direction);
        await page.waitForTimeout(400);
      }
      expect(predicate(await readState())).toBe(true);
    };
    await scrollUntil((state) => state.visible);
    await expect(showcase.locator('video[data-active="true"]')).toHaveAttribute("src", "/videos/macbook-air-orbit-scrub.webm");
    const orbitWidth = await laptopWidth();
    await page.screenshot({ path: test.info().outputPath("project-1-swivel.png") });
    for (const direction of [1, -1]) {
      const titles = direction === 1
        ? ["BiteScout", "Lutoko", "Developer Portfolio"]
        : ["Lutoko", "BiteScout", "RAG Backend"];
      for (const title of titles) {
        await scrollUntil((state) => state.frame > 2 && state.frame < 58, direction);
        expect((await readState()).visible).toBe(false);
        await scrollUntil((state) => state.frame < 1, direction);
        expect((await readState()).visible).toBe(false);
        await page.screenshot({ path: test.info().outputPath(`${direction}-${title}-closed.png`) });
        await scrollUntil((state) => state.title === title && state.frame > 2 && state.frame < 58, direction);
        expect((await readState()).visible).toBe(false);
        await scrollUntil((state) => state.title === title && state.visible, direction);
        await expect(showcase.locator('video[data-active="true"]')).toHaveAttribute("src", title === "RAG Backend"
          ? "/videos/macbook-air-orbit-scrub.webm"
          : "/videos/macbook-air-open-close-scrub.webm");
        expect(Math.abs(await laptopWidth() - orbitWidth)).toBeLessThan(20);
        await page.screenshot({ path: test.info().outputPath(`${direction}-${title}-open.png`) });
      }
    }
  });

  test("fits the thumbnail inside the screen and preserves the notch", async ({ page }) => {
    await page.route("**/projects/rag-backend.svg", (route) => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><path fill="#ff00ff" d="M0 0h1600v1000H0z"/><path fill="#00ff00" d="M400 250h800v500H400z"/></svg>',
    }));
    await page.goto("/");
    const canvas = page.locator(".project-showcase-canvas");
    await expect(page.getByTestId("project-showcase")).toHaveAttribute("data-cache-ready", "true", { timeout: 120_000 });
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByTestId("project-showcase")).toBeHidden();
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    for (const video of await page.locator(".project-showcase-video").all()) {
      await expect(video).not.toHaveAttribute("src");
    }
    await page.screenshot({ path: "e2e/screenshots/projects-showcase/mobile-cards.png" });
  });

  test("keeps project cards when Projects is reached before the cache is ready", async ({ page }) => {
    await page.route("**/videos/*scrub.webm", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.continue();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("#projects").evaluate((element) => element.scrollIntoView({ block: "start" }));
    const showcase = page.getByTestId("project-showcase");
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    await expect(showcase).toHaveAttribute("data-cache-ready", "false");
    await page.waitForTimeout(3000);
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    await expect(showcase).toBeHidden();
    await expect(showcase.locator("..")).not.toHaveClass(/pin-spacer/);
    await page.screenshot({ path: test.info().outputPath("early-project-card-fallback.png") });
    for (const video of await showcase.locator("video").all()) {
      await expect(video).not.toHaveAttribute("src");
    }
  });

  test("falls back to project cards if a clip fails to load", async ({ page }) => {
    await page.route("**/videos/*scrub.webm", (route) => route.abort());
    await page.goto("/");
    const showcase = page.getByTestId("project-showcase");
    await expect(showcase).toHaveClass(/project-showcase-failed/);
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    await expect(showcase.locator("..")).not.toHaveClass(/pin-spacer/);
    await page.screenshot({ path: test.info().outputPath("video-load-fallback.png") });
  });
});

test.describe("showcase scroll performance", () => {
  test.use({ deviceScaleFactor: 2 });

  test("uses cached frames without seeking or pixel processing while scrolling", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto("/");
    const showcase = page.getByTestId("project-showcase");
    await expect(showcase).toHaveAttribute("data-cache-ready", "true", { timeout: 120_000 });
    await expect(showcase.locator("..")).toHaveClass(/pin-spacer/);
    const metrics = await showcase.evaluate(async (root) => {
      const scroller = document.querySelector<HTMLElement>("[data-web-scroll-container]")!;
      const spacer = root.parentElement!;
      const start = scroller.scrollTop + spacer.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      const distance = spacer.offsetHeight - (root as HTMLElement).offsetHeight;
      const clips = Array.from(root.querySelectorAll("video"));
      let seeks = 0;
      const handlers = clips.map((clip) => {
        const seeking = () => { seeks += 1; };
        clip.addEventListener("seeking", seeking);
        return { seeking };
      });
      let pixelReads = 0;
      let pixelWrites = 0;
      const canvasDraws: number[] = [];
      const originalGet = CanvasRenderingContext2D.prototype.getImageData;
      const originalPut = CanvasRenderingContext2D.prototype.putImageData;
      const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.getImageData = function (...args: Parameters<typeof originalGet>) {
        pixelReads += 1;
        return originalGet.apply(this, args);
      };
      CanvasRenderingContext2D.prototype.putImageData = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof originalPut>) {
        pixelWrites += 1;
        return originalPut.apply(this, args);
      } as typeof originalPut;
      CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof originalDraw>) {
        const began = performance.now();
        const result = originalDraw.apply(this, args);
        if ((this.canvas as HTMLCanvasElement).classList?.contains("project-showcase-canvas")) canvasDraws.push(performance.now() - began);
        return result;
      } as typeof originalDraw;
      const frames: number[] = [];
      try {
        await new Promise<void>((resolve) => {
          const began = performance.now();
          let previous = began;
          const tick = (now: number) => {
            frames.push(now - previous);
            previous = now;
            const progress = Math.min(1, (now - began) / 14_000);
            scroller.scrollTop = start + distance * (progress < 0.5 ? progress * 2 : 2 - progress * 2);
            if (progress < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        await new Promise((resolve) => setTimeout(resolve, 700));
      } finally {
        clips.forEach((clip, index) => clip.removeEventListener("seeking", handlers[index].seeking));
        CanvasRenderingContext2D.prototype.getImageData = originalGet;
        CanvasRenderingContext2D.prototype.putImageData = originalPut;
        CanvasRenderingContext2D.prototype.drawImage = originalDraw;
      }
      const summarize = (values: number[]) => {
        values.sort((a, b) => a - b);
        return { count: values.length, p95: values[Math.floor(values.length * 0.95)], max: values.at(-1) };
      };
      return { frames: summarize(frames.slice(2)), seeks, pixelReads, pixelWrites, canvasDraws: summarize(canvasDraws) };
    });
    await testInfo.attach("scroll-timing", { body: JSON.stringify(metrics, null, 2), contentType: "application/json" });
    expect(metrics.seeks).toBe(0);
    expect(metrics.pixelReads).toBe(0);
    expect(metrics.pixelWrites).toBe(0);
    // Keep the headless rAF metric observable; enforce the deterministic canvas work budget below.
    expect(metrics.frames.p95).toBeLessThan(100);
    expect(metrics.canvasDraws.p95).toBeLessThan(16.7);
    await expect.poll(() => showcase.locator("canvas").getAttribute("data-logical-frame").then(Number)).toBeLessThan(1);
  });

  test("reuses the decoded frame during text reveals on high-DPI screens", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await expect(page.getByTestId("project-showcase")).toHaveAttribute("data-cache-ready", "true", { timeout: 120_000 });
    const canvas = page.locator(".project-showcase-canvas");
    await page.locator("#projects").evaluate((element) => element.scrollIntoView());
    await page.locator("[data-web-scroll-container]").evaluate((element) => element.scrollBy(0, 1800));
    await expect(canvas).toHaveAttribute("data-thumbnail-visible", "true");
    expect(await canvas.evaluate((element) => (element as HTMLCanvasElement).width)).toBeLessThanOrEqual(960);

    const work = await page.evaluate(async () => {
      let reads = 0;
      let draws = 0;
      const original = CanvasRenderingContext2D.prototype.getImageData;
      const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.getImageData = function (...args: Parameters<typeof original>) {
        reads += 1;
        return original.apply(this, args);
      };
      CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof originalDraw>) {
        if ((this.canvas as HTMLCanvasElement).classList?.contains("project-showcase-canvas")) draws += 1;
        return originalDraw.apply(this, args);
      } as typeof originalDraw;
      try {
        const scroller = document.querySelector("[data-web-scroll-container]")!;
        for (let step = 0; step < 20; step += 1) {
          scroller.scrollBy(0, 10);
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { reads, draws };
      } finally {
        CanvasRenderingContext2D.prototype.getImageData = original;
        CanvasRenderingContext2D.prototype.drawImage = originalDraw;
      }
    });
    expect(work).toEqual({ reads: 0, draws: 0 });
    await expect(canvas).toHaveAttribute("data-thumbnail-visible", "true");
    await page.screenshot({ path: test.info().outputPath("high-dpi-open.png") });
  });

  test("respects reduced motion without loading video", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("project-showcase")).toBeHidden();
    await expect(page.locator(".project-cards-fallback")).toBeVisible();
    for (const video of await page.locator(".project-showcase-video").all()) {
      await expect(video).not.toHaveAttribute("src");
    }
  });
});
