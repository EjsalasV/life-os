import { describe, expect, it } from "vitest";
import { calculateDailySpendingLimit } from "./dailySpendingLimit";

const base = {
  today: "2026-10-22" as const,
  nextIncomeDate: "2026-11-01" as const,
  currentCash: 1000,
  fixedCostsRemaining: 200,
  monthlySavingsTarget: 100,
  sinkingFundsRemaining: 50,
  minimumBuffer: 250
};

describe("calculateDailySpendingLimit", () => {
  it("reserves obligations before distributing cash until the next income", () => {
    const result = calculateDailySpendingLimit(base);
    expect(result).toMatchObject({ status: "available", reservedAmount: 600, spendableBeforeDailyLimit: 400, daysUntilNextIncome: 10, dailyAmount: 40 });
  });

  it("reports insufficient funds instead of hiding a negative balance", () => {
    const result = calculateDailySpendingLimit({ ...base, currentCash: 500 });
    expect(result).toMatchObject({ status: "insufficient-funds", dailyAmount: 0, spendableBeforeDailyLimit: -100, shortfall: 100 });
  });

  it("requires a next-income schedule and never uses unconfirmed income", () => {
    const result = calculateDailySpendingLimit({ ...base, nextIncomeDate: undefined, currentCash: 5000 });
    expect(result).toMatchObject({ status: "no-income-schedule", dailyAmount: 0, daysUntilNextIncome: null });
  });

  it("uses one day when income is due today and handles invalid dates safely", () => {
    expect(calculateDailySpendingLimit({ ...base, nextIncomeDate: base.today }).daysUntilNextIncome).toBe(1);
    expect(calculateDailySpendingLimit({ ...base, nextIncomeDate: "2026-10-20" }).status).toBe("no-income-schedule");
  });

  it("does not allow invalid or negative amounts to inflate the limit", () => {
    const result = calculateDailySpendingLimit({ ...base, currentCash: Number.NaN, fixedCostsRemaining: -100, monthlySavingsTarget: Number.POSITIVE_INFINITY });
    expect(result).toMatchObject({ status: "insufficient-funds", dailyAmount: 0, reservedAmount: 300, shortfall: 300 });
  });
});
