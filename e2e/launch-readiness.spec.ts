import { expect, test } from "@playwright/test";

test("home page exposes share metadata and legal navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Andrei's Portfolio");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Full-Stack Developer/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute("href", "/terms");
});

test("legal routes and custom 404 render", async ({ page }) => {
  for (const route of ["/privacy", "/terms"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("link", { name: "Back to portfolio" })).toBeVisible();
  }

  const missing = await page.goto("/definitely-missing");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
});

test("robots, sitemap, and social preview are available", async ({ request }) => {
  const checks = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
    request.get("/opengraph-image"),
  ]);
  expect(checks.every((response) => response.ok())).toBe(true);
  expect(await checks[0].text()).toContain("Sitemap:");
  expect(await checks[1].text()).toContain("/privacy");
  expect(checks[2].headers()["content-type"]).toContain("image/png");
});

test("contact form validates empty submissions", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Subject is required")).toBeVisible();
  await expect(page.getByText("Message is required")).toBeVisible();
});

test("mobile layout has no horizontal overflow or undersized header controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  const controls = page.locator("header button:visible");
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
