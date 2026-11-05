import path from "node:path";
import { defineConfig } from "vitest/config";

/** Unit tests for domain rules. They do not touch Postgres. */
export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
