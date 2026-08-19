import { test, expect } from "@playwright/test";

const SECTIONS = ["about", "services", "skills", "projects", "contact"] as const;

async function smoothScrollTo(page: import("@playwright/test").Page, sectionId: string) {
  await page.evaluate((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, sectionId);
  // Let the smooth-scroll animation play out visibly before settling.
  await page.waitForTimeout(1200);
}

test.describe("Manual walkthrough: scroll sections and open Lutoko project", () => {
  test("scrolls through each section and opens the Lutoko project modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("heading", { name: "Andrei Kyle Hidalgo" }).waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    for (const sectionId of SECTIONS) {
      await smoothScrollTo(page, sectionId);
      await expect(page.locator(`#${sectionId}`)).toBeVisible();
      await page.screenshot({ path: `e2e/screenshots/walkthrough/${sectionId}.png` });
    }

    // Open the Lutoko project card from the Projects section.
    await page.getByRole("button", { name: "View details for Lutoko" }).click();
    await page.locator("#project-modal-title").waitFor({ state: "visible" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: "e2e/screenshots/walkthrough/lutoko-modal.png" });
  });
});
