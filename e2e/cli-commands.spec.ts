import { test, expect, type Page } from "@playwright/test";

const COMMANDS: { name: string; input: string; expectText: string | RegExp }[] = [
  { name: "help", input: "help", expectText: "Available Commands" },
  { name: "about", input: "about", expectText: "Full-Stack Developer" },
  { name: "skills", input: "skills", expectText: "Frontend" },
  { name: "services", input: "services", expectText: "Web Development" },
  { name: "projects", input: "projects", expectText: "Lutoko" },
  { name: "contact", input: "contact", expectText: "andreihidalgo16@gmail.com" },
  { name: "ask", input: "ask what is your tech stack", expectText: "skill set includes" },
  { name: "unknown-command", input: "foobar123", expectText: "Command not found" },
  { name: "clear", input: "clear", expectText: /^$/ },
];

async function typeCommand(page: Page, command: string) {
  const input = page.getByLabel("Terminal command input");
  await input.click();
  await input.fill(command);
  await input.press("Enter");
}

test.describe("CLI mode command walkthrough", () => {
  test("types and verifies every terminal command", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/");
    await page.getByRole("heading", { name: "Andrei Kyle Hidalgo" }).waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    await page.getByRole("main").getByRole("button", { name: "Switch to CLI view" }).click();
    const input = page.getByLabel("Terminal command input");
    await input.waitFor({ state: "visible" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: "e2e/screenshots/cli-commands/00-welcome.png" });

    for (const [index, command] of COMMANDS.entries()) {
      await typeCommand(page, command.input);

      if (command.name === "clear") {
        await page.waitForTimeout(300);
        await expect(page.locator("text=Available Commands")).toHaveCount(0);
      } else {
        await expect(page.locator("main")).toContainText(command.expectText, { timeout: 15_000 });
      }

      await page.waitForTimeout(300);
      const shotName = `${String(index + 1).padStart(2, "0")}-${command.name}.png`;
      await page.screenshot({ path: `e2e/screenshots/cli-commands/${shotName}` });
    }

    // "theme" switches back to the web view — verify and capture last.
    await typeCommand(page, "theme");
    await expect(page.getByRole("main").getByRole("button", { name: "Switch to CLI view" })).toBeVisible();
    await page.waitForTimeout(300);
    await page.screenshot({ path: "e2e/screenshots/cli-commands/99-theme-back-to-web.png" });
  });
});
