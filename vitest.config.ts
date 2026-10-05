import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/ignored-local/**", "**/.cache/**"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
