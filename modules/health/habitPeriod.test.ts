import { describe, expect, it } from "vitest";
import { getHabitPeriodRange, getHabitPeriodStatus, isHabitCompletedForPeriod } from "./habitPeriod";

const day = (fecha: string, habitosChecks: string[] = []) => ({ fecha, habitosChecks });

describe("habit period semantics", () => {
  it("uses the local day for daily habits", () => {
    const date = new Date(2026, 9, 7);
    expect(getHabitPeriodRange("Diario", date)).toEqual({ start: "2026-10-07", end: "2026-10-07" });
    expect(isHabitCompletedForPeriod("h1", "Diario", [day("2026-10-07", ["h1"])], date)).toBe(true);
    expect(isHabitCompletedForPeriod("h1", "Diario", [day("2026-10-06", ["h1"])], date)).toBe(false);
  });

  it("keeps a Monday-to-Sunday weekly period", () => {
    const wednesday = new Date(2026, 9, 7);
    expect(getHabitPeriodRange("Semanal", wednesday)).toEqual({ start: "2026-10-05", end: "2026-10-11" });
    expect(isHabitCompletedForPeriod("h1", "Semanal", [day("2026-10-05", ["h1"])], wednesday)).toBe(true);
    expect(isHabitCompletedForPeriod("h1", "Semanal", [day("2026-09-28", ["h1"])], wednesday)).toBe(false);
  });

  it("resets weekly status on the next Monday", () => {
    expect(isHabitCompletedForPeriod("h1", "Semanal", [day("2026-10-11", ["h1"])], new Date(2026, 9, 12))).toBe(false);
  });

  it("uses calendar months and handles month boundaries", () => {
    const october = new Date(2026, 9, 31);
    expect(getHabitPeriodRange("Mensual", october)).toEqual({ start: "2026-10-01", end: "2026-10-31" });
    expect(isHabitCompletedForPeriod("h1", "Mensual", [day("2026-10-01", ["h1"])], october)).toBe(true);
    expect(isHabitCompletedForPeriod("h1", "Mensual", [day("2026-09-30", ["h1"])], october)).toBe(false);
  });

  it("returns a reusable status object", () => {
    expect(getHabitPeriodStatus("h1", "Mensual", [day("2026-10-07", ["h1"])], new Date(2026, 9, 7)).completed).toBe(true);
  });
});
