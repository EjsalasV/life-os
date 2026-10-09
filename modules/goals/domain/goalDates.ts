import type { GoalDate } from "../types";

export function isGoalDate(value: string): value is GoalDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isGoalOverdue(goal: { status: string; targetDate?: string }, today: GoalDate): boolean {
  return goal.status === "active" && !!goal.targetDate && isGoalDate(goal.targetDate) && goal.targetDate < today;
}
