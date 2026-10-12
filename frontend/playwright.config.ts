import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../tests/e2e/shooter",
  tsconfig: "../tests/tsconfig.json",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173", headless: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: `${process.platform === "win32" ? "npm.cmd" : "npm"} run dev -- --host 127.0.0.1 --port 5173 --strictPort`,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    env: { API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8000" },
    timeout: 60000,
  },
});
