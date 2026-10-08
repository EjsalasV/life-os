import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("integration architecture", () => {
  it("keeps Health on the shared idempotency infrastructure", () => {
    const healthSource = readFileSync(new URL("../health/server/healthIntegrationService.ts", import.meta.url), "utf8");
    expect(healthSource).toContain("@/modules/integrations/core/idempotency");
    expect(healthSource).not.toMatch(/function\s+idempotencyRef/);
  });
});
