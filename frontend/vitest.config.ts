import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@shooter": fileURLToPath(new URL("./src/features/shooter", import.meta.url)) } },
  test: { include: ["../tests/unit/frontend/**/*.test.ts"], environment: "node" },
});
