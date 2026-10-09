import { describe, expect, it } from "vitest";
import {
  assertGoalStatusTransition,
  calculateGoalProgress,
  canTransitionGoalStatus,
  isGoalDate,
  isGoalOverdue,
  transitionGoalStatus,
  updateGoalIndicatorCurrentValue
} from "@/modules/goals/domain";

describe("Goals domain", () => {
  it("calculates increase and decrease progress with clamping", () => {
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: 5, targetValue: 10 })).toBe(50);
    expect(calculateGoalProgress({ type: "number", direction: "decrease", initialValue: 100, currentValue: 96, targetValue: 85 })).toBeCloseTo(26.6666667);
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: 20, targetValue: 10 })).toBe(100);
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: -5, targetValue: 10 })).toBe(0);
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: 15, targetValue: 10 })).toBe(100);
  });

  it("supports boolean progress and invalid defensive inputs", () => {
    expect(calculateGoalProgress({ type: "boolean", currentValue: false, targetValue: true })).toBe(0);
    expect(calculateGoalProgress({ type: "boolean", currentValue: true, targetValue: true })).toBe(100);
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: Number.NaN, targetValue: 10 })).toBe(0);
    expect(calculateGoalProgress({ type: "number", direction: "increase", initialValue: 0, currentValue: 1, targetValue: 0 })).toBe(0);
    expect(calculateGoalProgress({ type: "percentage", direction: "increase", initialValue: 100, currentValue: 100, targetValue: 100 })).toBe(0);
  });

  it("updates only currentValue and preserves the rest immutably", () => {
    const indicator = { type: "count" as const, direction: "increase" as const, initialValue: 0, currentValue: 1, targetValue: 3, unit: "libros" };
    const updated = updateGoalIndicatorCurrentValue(indicator, 2);
    expect(updated).toEqual({ ...indicator, currentValue: 2 });
    expect(indicator.currentValue).toBe(1);
    expect(() => updateGoalIndicatorCurrentValue(indicator, 1.5)).toThrow();
    expect(() => updateGoalIndicatorCurrentValue({ type: "boolean", currentValue: false, targetValue: true }, 1)).toThrow();
  });

  it("allows only the defined status transitions", () => {
    const allowed = [["active", "paused"], ["active", "completed"], ["active", "canceled"], ["paused", "active"], ["paused", "completed"], ["paused", "canceled"]] as const;
    for (const [from, to] of allowed) expect(canTransitionGoalStatus(from, to)).toBe(true);
    for (const status of ["active", "paused", "completed", "canceled"] as const) expect(canTransitionGoalStatus(status, status)).toBe(true);
    for (const [from, to] of [["completed", "active"], ["completed", "paused"], ["completed", "canceled"], ["canceled", "active"], ["canceled", "completed"]] as const) {
      expect(canTransitionGoalStatus(from, to)).toBe(false);
      expect(() => assertGoalStatusTransition(from, to)).toThrow();
    }
    expect(transitionGoalStatus({ status: "active", name: "x" }, "paused").status).toBe("paused");
  });

  it("validates calendar dates and derives overdue deterministically", () => {
    expect(isGoalDate("2027-03-31")).toBe(true);
    expect(isGoalDate("2027-02-30")).toBe(false);
    expect(isGoalOverdue({ status: "active", targetDate: "2027-03-30" }, "2027-03-31")).toBe(true);
    expect(isGoalOverdue({ status: "active", targetDate: "2027-04-01" }, "2027-03-31")).toBe(false);
    expect(isGoalOverdue({ status: "paused", targetDate: "2027-03-01" }, "2027-03-31")).toBe(false);
    expect(isGoalOverdue({ status: "completed", targetDate: "2027-03-01" }, "2027-03-31")).toBe(false);
    expect(isGoalOverdue({ status: "active" }, "2027-03-31")).toBe(false);
  });
});
