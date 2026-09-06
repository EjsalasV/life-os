import { useCallback } from 'react';
import { useStoredValue } from './useStoredValue';
import { useLocalDay } from './useLocalDay';
import { getTodayKey } from '@/app/utils/helpers';
export type HabitType = 'water' | 'food' | 'activity' | 'sleep';
export interface HabitLogs { water: number; food: number; activity: number; sleep: number; date: string }
export interface HabitLimits { water: number; food: number; activity: number; sleep: number }
const HABIT_LIMITS: HabitLimits = { water: 8, food: 4, activity: 2, sleep: 1 };
const empty: HabitLogs = { water: 0, food: 0, activity: 0, sleep: 0, date: '' };
const valid = (value: unknown): value is HabitLogs => {
  if (!value || typeof value !== 'object') return false;
  const v = value as HabitLogs;
  return typeof v.date === 'string' && Object.keys(HABIT_LIMITS).every((key) => Number.isInteger(v[key as HabitType]) && v[key as HabitType] >= 0);
};
export function useHabitLogs(userId?: string) {
  const day = useLocalDay();
  const [saved, setLogs, storageError] = useStoredValue(`habit-logs-${userId || 'main'}`, empty, valid);
  const logs = saved.date === day ? saved : { ...empty, date: day };
  const logHabit = useCallback((habit: HabitType): boolean => {
    let recorded = false;
    const success = setLogs((current) => {
      const today = getTodayKey();
      const now = current.date === today ? current : { ...empty, date: today };
      if (now[habit] >= HABIT_LIMITS[habit]) return now;
      recorded = true;
      return { ...now, [habit]: now[habit] + 1 };
    });
    return success && recorded;
  }, [setLogs]);
  return { logs, storageError, logHabit, HABIT_LIMITS,
    hasReachedLimit: (habit: HabitType) => logs[habit] >= HABIT_LIMITS[habit],
    getCount: (habit: HabitType) => logs[habit],
    getLimit: (habit: HabitType) => HABIT_LIMITS[habit],
    getProgress: (habit: HabitType) => logs[habit] / HABIT_LIMITS[habit] * 100 };
}
