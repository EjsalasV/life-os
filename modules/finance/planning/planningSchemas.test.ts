import { describe, expect, it } from "vitest";
import { dailySpendingLimitInputSchema, financialPlanningConfigSchema, recurringIncomeSchema } from "./planningSchemas";

describe("finance planning schemas", () => {
  it("accepts planning configuration and recurring income", () => {
    expect(financialPlanningConfigSchema.safeParse({ monthlySavingsTarget: 100, minimumBuffer: 250 }).success).toBe(true);
    expect(recurringIncomeSchema.safeParse({ name: "Cliente A", amount: 500, frequency: "irregular", nextExpectedDate: "2026-11-01", active: true }).success).toBe(true);
  });

  it("rejects invalid dates, negative amounts, and arbitrary fields", () => {
    expect(recurringIncomeSchema.safeParse({ name: "Ingreso", amount: 500, frequency: "monthly", nextExpectedDate: "2026-02-30", active: true }).success).toBe(false);
    expect(recurringIncomeSchema.safeParse({ name: "Ingreso", amount: -1, frequency: "monthly", nextExpectedDate: "2026-11-01", active: true }).success).toBe(false);
    expect(financialPlanningConfigSchema.safeParse({ monthlySavingsTarget: 0, minimumBuffer: 0, paydayDay: 15 }).success).toBe(false);
    expect(dailySpendingLimitInputSchema.safeParse({ today: "2026-10-22", currentCash: 100, fixedCostsRemaining: 10, monthlySavingsTarget: 10, sinkingFundsRemaining: 10, minimumBuffer: 10, nextIncomeDate: "2026-11-01", unexpected: true }).success).toBe(false);
  });
});
