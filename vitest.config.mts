import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@lib": resolve(import.meta.dirname, "lib"),
      "@": resolve(import.meta.dirname, "src"),
    },
  },
});
