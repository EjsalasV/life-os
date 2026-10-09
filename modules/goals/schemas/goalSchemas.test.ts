import { describe, expect, it } from "vitest";
import {
  booleanGoalIndicatorSchema,
  countGoalIndicatorSchema,
  createGoalSchema,
  goalIndicatorSchema,
  numberGoalIndicatorSchema,
  percentageGoalIndicatorSchema,
  updateGoalProgressSchema,
  updateGoalSchema
} from "@/modules/goals/schemas";

const numberIndicator = { type: "number" as const, direction: "increase" as const, initialValue: 0, currentValue: 2, targetValue: 10 };

describe("Goals schemas", () => {
  it("accepts a valid goal and rejects invalid text, area, date, and obstacles", () => {
    expect(createGoalSchema.safeParse({ name: "Leer libros", area: "personal", targetDate: "2027-03-31", indicator: { type: "count", direction: "increase", initialValue: 0, currentValue: 3, targetValue: 12 } }).success).toBe(true);
    expect(createGoalSchema.safeParse({ name: " ", area: "personal", indicator: numberIndicator }).success).toBe(false);
    expect(createGoalSchema.safeParse({ name: "Meta", area: "other", indicator: numberIndicator }).success).toBe(false);
    expect(createGoalSchema.safeParse({ name: "Meta", area: "personal", targetDate: "2027-02-30", indicator: numberIndicator }).success).toBe(false);
    expect(createGoalSchema.safeParse({ name: "x".repeat(121), area: "personal", indicator: numberIndicator }).success).toBe(false);
    expect(createGoalSchema.safeParse({ name: "Meta", area: "personal", obstacles: ["a", "b", "c", "d", "e", "f"], indicator: numberIndicator }).success).toBe(false);
    expect(createGoalSchema.safeParse({ name: "Meta", area: "personal", obstacles: [""], indicator: numberIndicator }).success).toBe(false);
  });

  it("validates indicator variants and rejects cross-variant fields", () => {
    expect(numberGoalIndicatorSchema.safeParse(numberIndicator).success).toBe(true);
    expect(numberGoalIndicatorSchema.safeParse({ ...numberIndicator, direction: "decrease", initialValue: 10, targetValue: 0 }).success).toBe(true);
    expect(numberGoalIndicatorSchema.safeParse({ ...numberIndicator, targetValue: -1 }).success).toBe(false);
    expect(numberGoalIndicatorSchema.safeParse({ ...numberIndicator, currentValue: Number.NaN }).success).toBe(false);
    expect(numberGoalIndicatorSchema.safeParse({ ...numberIndicator, currentValue: Number.POSITIVE_INFINITY }).success).toBe(false);
    expect(countGoalIndicatorSchema.safeParse({ type: "count", direction: "increase", initialValue: 0, currentValue: 1, targetValue: 3 }).success).toBe(true);
    expect(countGoalIndicatorSchema.safeParse({ type: "count", direction: "increase", initialValue: 0, currentValue: 1.5, targetValue: 3 }).success).toBe(false);
    expect(percentageGoalIndicatorSchema.safeParse({ type: "percentage", direction: "increase", initialValue: 0, currentValue: 40, targetValue: 100 }).success).toBe(true);
    expect(percentageGoalIndicatorSchema.safeParse({ type: "percentage", direction: "increase", initialValue: 0, currentValue: 101, targetValue: 100 }).success).toBe(false);
    expect(booleanGoalIndicatorSchema.safeParse({ type: "boolean", currentValue: false, targetValue: true }).success).toBe(true);
    expect(booleanGoalIndicatorSchema.safeParse({ type: "boolean", currentValue: false, targetValue: false }).success).toBe(false);
    expect(goalIndicatorSchema.safeParse({ ...numberIndicator, currentValue: 2, completed: true }).success).toBe(false);
    expect(goalIndicatorSchema.safeParse({ type: "boolean", currentValue: false, targetValue: true, initialValue: 0 }).success).toBe(false);
  });

  it("keeps create active-only and limits update inputs", () => {
    expect(createGoalSchema.safeParse({ name: "Meta", area: "personal", status: "paused", indicator: numberIndicator }).success).toBe(false);
    expect(updateGoalSchema.safeParse({ status: "completed" }).success).toBe(false);
    expect(updateGoalSchema.safeParse({ createdAt: "now" }).success).toBe(false);
    expect(updateGoalSchema.safeParse({ name: "Nueva meta", indicator: numberIndicator }).success).toBe(true);
    expect(updateGoalSchema.safeParse({}).success).toBe(false);
    expect(updateGoalProgressSchema.safeParse({ currentValue: 5 }).success).toBe(true);
    expect(updateGoalProgressSchema.safeParse({ currentValue: true }).success).toBe(true);
    expect(updateGoalProgressSchema.safeParse({ currentValue: 5, targetValue: 10 }).success).toBe(false);
  });
});
