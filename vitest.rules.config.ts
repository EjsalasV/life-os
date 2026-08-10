import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["firestore.rules.integration.ts"],
    testTimeout: 15_000
  }
});
