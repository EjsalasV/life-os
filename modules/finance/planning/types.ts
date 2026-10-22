export type PlanningDate = `${number}-${number}-${number}`;
export type IncomeFrequency = "weekly" | "biweekly" | "monthly" | "irregular";

export type FinancialPlanningConfig = {
  monthlySavingsTarget: number;
  minimumBuffer: number;
};

export type RecurringIncome = {
  id?: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  nextExpectedDate: PlanningDate;
  active: boolean;
};

export type PlanningReservation = {
  name: string;
  amountRemaining: number;
};

export type DailySpendingLimitInput = {
  today: PlanningDate;
  nextIncomeDate?: PlanningDate;
  currentCash: number;
  fixedCostsRemaining: number;
  monthlySavingsTarget: number;
  sinkingFundsRemaining: number;
  minimumBuffer: number;
};

export type DailySpendingLimitStatus = "available" | "insufficient-funds" | "no-income-schedule";

export type DailySpendingLimit = {
  status: DailySpendingLimitStatus;
  dailyAmount: number;
  spendableBeforeDailyLimit: number;
  reservedAmount: number;
  shortfall: number;
  daysUntilNextIncome: number | null;
};
