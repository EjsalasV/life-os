import { z } from "zod";
import { isPlanningDate } from "./dateUtils";

const planningDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isPlanningDate, "La fecha no es válida.");
const nonNegativeMoney = z.number().finite().nonnegative();

export const financialPlanningConfigSchema = z.object({
  monthlySavingsTarget: nonNegativeMoney,
  minimumBuffer: nonNegativeMoney
}).strict();

export const recurringIncomeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  amount: z.number().finite().positive(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "irregular"]),
  nextExpectedDate: planningDateSchema,
  active: z.boolean()
}).strict();

export const dailySpendingLimitInputSchema = z.object({
  today: planningDateSchema,
  nextIncomeDate: planningDateSchema.optional(),
  currentCash: nonNegativeMoney,
  fixedCostsRemaining: nonNegativeMoney,
  monthlySavingsTarget: nonNegativeMoney,
  sinkingFundsRemaining: nonNegativeMoney,
  minimumBuffer: nonNegativeMoney
}).strict();
