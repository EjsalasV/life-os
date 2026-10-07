import { describe, expect, it, vi } from "vitest";
import { parseLegacyFastingTimestamp, toggleFastingValue } from "./fasting";

describe("fasting state", () => {
  it("starts in Firestore-compatible milliseconds and stops with null", () => {
    expect(toggleFastingValue(null, 123456)).toBe(123456);
    expect(toggleFastingValue(123456, 123999)).toBeNull();
  });

  it("parses valid legacy values and rejects future or invalid values", () => {
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
    expect(parseLegacyFastingTimestamp("2026-10-07T10:00:00Z")).toBe(new Date("2026-10-07T10:00:00Z").getTime());
    expect(parseLegacyFastingTimestamp("2026-10-07T13:00:00Z")).toBeNull();
    expect(parseLegacyFastingTimestamp("not-a-date")).toBeNull();
    vi.useRealTimers();
  });
});
