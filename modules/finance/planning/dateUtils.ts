import type { PlanningDate } from "./types";

export function isPlanningDate(value: string): value is PlanningDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function daysBetweenPlanningDates(from: PlanningDate, to: PlanningDate): number | null {
  if (!isPlanningDate(from) || !isPlanningDate(to)) return null;
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
}
