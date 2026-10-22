import { daysBetweenPlanningDates } from "./dateUtils";
import type { DailySpendingLimit, DailySpendingLimitInput } from "./types";

const finiteNonNegative = (value: number): number => Number.isFinite(value) && value > 0 ? value : 0;
const roundMoney = (value: number): number => Math.round(value * 100) / 100;

/**
 * Calculates today's safe spending pace without predicting unconfirmed income.
 * Fixed costs, savings, sinking funds, and the minimum buffer are reserved first.
 */
export function calculateDailySpendingLimit(input: DailySpendingLimitInput): DailySpendingLimit {
  const reservedAmount = [input.fixedCostsRemaining, input.monthlySavingsTarget, input.sinkingFundsRemaining, input.minimumBuffer]
    .map(finiteNonNegative)
    .reduce((sum, value) => sum + value, 0);
  const spendableBeforeDailyLimit = roundMoney(finiteNonNegative(input.currentCash) - reservedAmount);
  const shortfall = roundMoney(Math.max(0, reservedAmount - finiteNonNegative(input.currentCash)));
  const days = input.nextIncomeDate ? daysBetweenPlanningDates(input.today, input.nextIncomeDate) : null;

  if (days === null || days < 0) {
    return { status: "no-income-schedule", dailyAmount: 0, spendableBeforeDailyLimit, reservedAmount, shortfall, daysUntilNextIncome: null };
  }

  const daysUntilNextIncome = Math.max(1, days);
  if (spendableBeforeDailyLimit <= 0) {
    return { status: "insufficient-funds", dailyAmount: 0, spendableBeforeDailyLimit, reservedAmount, shortfall, daysUntilNextIncome };
  }

  return {
    status: "available",
    dailyAmount: roundMoney(spendableBeforeDailyLimit / daysUntilNextIncome),
    spendableBeforeDailyLimit,
    reservedAmount,
    shortfall: 0,
    daysUntilNextIncome
  };
}
