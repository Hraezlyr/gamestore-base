/// <reference types="node" />
import { defineConfig } from "@playwright/test";
import process from "node:process";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: fileURLToPath(new URL("./tests/e2e", import.meta.url)),
  tsconfig: fileURLToPath(new URL("./tsconfig.tests.json", import.meta.url)),
  outputDir: fileURLToPath(new URL("../../../test-results/shooter", import.meta.url)),
  workers: 1,
  reporter: "list",
  timeout: 60000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    cwd: fileURLToPath(new URL("../../../", import.meta.url)),
    command: `${process.platform === "win32" ? "npm.cmd" : "npm"} run dev -- --host 127.0.0.1 --port 5173 --strictPort`,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    env: { API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8000" },
    timeout: 60000,
  },
});
