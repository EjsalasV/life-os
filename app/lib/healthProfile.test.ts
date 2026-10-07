import { describe, expect, it } from "vitest";
import { getDailyExerciseMinutes, resolveCurrentWeight } from "./healthProfile";

describe("healthProfile helpers", () => {
  it("uses the latest valid weight and falls back to the profile", () => {
    expect(resolveCurrentWeight([
      { peso: 80, timestamp: new Date("2026-10-01") },
      { peso: 78.5, timestamp: new Date("2026-10-06") }
    ], { peso: 90 })).toBe(78.5);
    expect(resolveCurrentWeight([], { peso: 90 })).toBe(90);
    expect(resolveCurrentWeight([], null)).toBeNull();
  });

  it("prefers detailed activity minutes when available", () => {
    expect(getDailyExerciseMinutes({ ejercicioMinutos: 15, deficitCalorico: { actividades: [{ minutos: 20 }, { minutos: 25 }] } })).toBe(45);
    expect(getDailyExerciseMinutes({ ejercicioMinutos: 15 })).toBe(15);
  });
});
