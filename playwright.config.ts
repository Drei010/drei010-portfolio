import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "webkit", testMatch: "gameplay.spec.ts", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
    { name: "iphone-portrait", testMatch: "gameplay.spec.ts", use: { ...devices["iPhone 15"] } },
    { name: "iphone-landscape", testMatch: "gameplay.spec.ts", use: { ...devices["iPhone 15 landscape"] } },
    { name: "ipad-portrait", testMatch: "gameplay.spec.ts", use: { ...devices["iPad (gen 7)"] } },
    { name: "ipad-landscape", testMatch: "gameplay.spec.ts", use: { ...devices["iPad (gen 7) landscape"] } },
    { name: "android-webview", testMatch: "gameplay.spec.ts", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_PRODUCTION ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
