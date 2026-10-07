import { describe, expect, it } from "vitest";
import { getHealthLocalDay } from "@/modules/health/server/healthIntegrationService";
import { healthCheckInIntegrationSchema, healthHabitCheckIntegrationSchema } from "@/modules/health/schemas/healthSchemas";

describe("Telegram health integration contracts", () => {
  it("uses the application's local day instead of UTC", () => {
    expect(getHealthLocalDay(new Date("2026-10-07T02:00:00.000Z"), "America/Guayaquil")).toBe("2026-10-06");
  });

  it("requires at least one check-in field and validates habit identifiers", () => {
    expect(healthCheckInIntegrationSchema.safeParse({}).success).toBe(false);
    expect(healthCheckInIntegrationSchema.safeParse({ mood: "genial" }).success).toBe(true);
    expect(healthHabitCheckIntegrationSchema.safeParse({ habitId: "sleep", idempotencyKey: "check-1" }).success).toBe(true);
  });
});
