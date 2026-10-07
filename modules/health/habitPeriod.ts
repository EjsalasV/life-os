import { getTodayKey } from "@/app/utils/helpers";

export type HabitFrequency = "Diario" | "Semanal" | "Mensual";

export interface HabitHealthDay {
  fecha?: string;
  habitosChecks?: string[];
}

export interface HabitPeriodRange {
  start: string;
  end: string;
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getHabitPeriodRange(frequency: HabitFrequency, date: Date = new Date()): HabitPeriodRange {
  const current = cloneDate(date);

  if (frequency === "Diario") {
    const key = getTodayKey(current);
    return { start: key, end: key };
  }

  if (frequency === "Mensual") {
    return {
      start: getTodayKey(new Date(current.getFullYear(), current.getMonth(), 1)),
      end: getTodayKey(new Date(current.getFullYear(), current.getMonth() + 1, 0))
    };
  }

  const daysSinceMonday = (current.getDay() + 6) % 7;
  const monday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - daysSinceMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return { start: getTodayKey(monday), end: getTodayKey(sunday) };
}

export function isHabitCompletedForPeriod(
  habitId: string,
  frequency: HabitFrequency,
  history: HabitHealthDay[] = [],
  date: Date = new Date()
): boolean {
  const range = getHabitPeriodRange(frequency, date);
  return history.some((day) => (
    typeof day?.fecha === "string" &&
    day.fecha >= range.start &&
    day.fecha <= range.end &&
    Array.isArray(day.habitosChecks) &&
    day.habitosChecks.includes(habitId)
  ));
}

export function getHabitPeriodStatus(
  habitId: string,
  frequency: HabitFrequency = "Diario",
  history: HabitHealthDay[] = [],
  date: Date = new Date()
) {
  const range = getHabitPeriodRange(frequency, date);
  return {
    frequency,
    range,
    completed: isHabitCompletedForPeriod(habitId, frequency, history, date)
  };
}
