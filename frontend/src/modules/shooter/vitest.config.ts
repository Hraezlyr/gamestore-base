import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("../../../", import.meta.url)),
  resolve: {
    alias: { "@shooter": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["src/modules/shooter/tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
