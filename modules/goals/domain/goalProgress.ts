import type { GoalIndicator } from "../types";

const clamp = (value: number): number => Math.min(100, Math.max(0, value));
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function isValidGoalIndicator(indicator: GoalIndicator): boolean {
  if (indicator.type === "boolean") return typeof indicator.currentValue === "boolean" && indicator.targetValue === true;
  if (!["number", "count", "percentage"].includes(indicator.type)) return false;
  if (!finite(indicator.initialValue) || !finite(indicator.currentValue) || !finite(indicator.targetValue)) return false;
  if (indicator.type === "count" && (![indicator.initialValue, indicator.currentValue, indicator.targetValue].every(Number.isInteger) || [indicator.initialValue, indicator.currentValue, indicator.targetValue].some((value) => value < 0))) return false;
  if (indicator.type === "percentage" && [indicator.initialValue, indicator.currentValue, indicator.targetValue].some((value) => value < 0 || value > 100)) return false;
  if (indicator.direction === "increase") return indicator.targetValue > indicator.initialValue;
  if (indicator.direction === "decrease") return indicator.targetValue < indicator.initialValue;
  return false;
}

export function calculateGoalProgress(indicator: GoalIndicator): number {
  if (indicator.type === "boolean") return indicator.currentValue === true && indicator.targetValue === true ? 100 : 0;
  if (!isValidGoalIndicator(indicator)) return 0;
  const denominator = indicator.direction === "increase"
    ? indicator.targetValue - indicator.initialValue
    : indicator.initialValue - indicator.targetValue;
  if (denominator === 0) return indicator.currentValue === indicator.targetValue ? 100 : 0;
  const progress = indicator.direction === "increase"
    ? ((indicator.currentValue - indicator.initialValue) / denominator) * 100
    : ((indicator.initialValue - indicator.currentValue) / denominator) * 100;
  return finite(progress) ? clamp(progress) : 0;
}

export function updateGoalIndicatorCurrentValue(indicator: GoalIndicator, currentValue: number | boolean): GoalIndicator {
  const next = indicator.type === "boolean"
    ? { ...indicator, currentValue }
    : { ...indicator, currentValue };
  if (!isValidGoalIndicator(next as GoalIndicator)) throw new Error("El valor actual no es válido para este indicador.");
  return next as GoalIndicator;
}
