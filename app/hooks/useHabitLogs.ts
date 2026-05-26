import { useState, useEffect, useCallback } from 'react';

export type HabitType = 'water' | 'food' | 'activity' | 'sleep';

export interface HabitLogs {
  water: number;
  food: number;
  activity: number;
  sleep: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

export interface HabitLimits {
  water: number;
  food: number;
  activity: number;
  sleep: number;
}

const HABIT_LIMITS: HabitLimits = {
  water: 8,
  food: 4,
  activity: 2,
  sleep: 1,
};

const INITIAL_LOGS: HabitLogs = {
  water: 0,
  food: 0,
  activity: 0,
  sleep: 0,
  date: new Date().toISOString().split('T')[0],
};

export function useHabitLogs(userId?: string) {
  const storageKey = `habit-logs-${userId || 'main'}`;
  const [logs, setLogs] = useState<HabitLogs>(() => {
    if (typeof window === 'undefined') return INITIAL_LOGS;

    const stored = localStorage.getItem(storageKey);
    const today = new Date().toISOString().split('T')[0];

    if (!stored) {
      return { ...INITIAL_LOGS, date: today };
    }

    try {
      const parsed = JSON.parse(stored);
      // Si es un día diferente, resetear contadores
      if (parsed.date !== today) {
        return { ...INITIAL_LOGS, date: today };
      }
      return parsed;
    } catch {
      return { ...INITIAL_LOGS, date: today };
    }
  });

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(logs));
  }, [logs, storageKey]);

  // Verificar si necesita resetear por cambio de día
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDate = () => {
      const today = new Date().toISOString().split('T')[0];
      setLogs((prevLogs) => {
        if (prevLogs.date !== today) {
          return { ...INITIAL_LOGS, date: today };
        }
        return prevLogs;
      });
    };

    // Verificar cada minuto si cambió de día
    const interval = setInterval(checkDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Verificar si un hábito ha alcanzado su límite
  const hasReachedLimit = useCallback((habit: HabitType): boolean => {
    return logs[habit] >= HABIT_LIMITS[habit];
  }, [logs]);

  // Registrar un hábito
  const logHabit = useCallback((habit: HabitType): boolean => {
    if (hasReachedLimit(habit)) {
      return false; // No permitir más registros
    }

    setLogs((prevLogs) => ({
      ...prevLogs,
      [habit]: prevLogs[habit] + 1,
    }));

    return true; // Hábito registrado exitosamente
  }, [hasReachedLimit]);

  // Obtener contador para un hábito
  const getCount = useCallback((habit: HabitType): number => {
    return logs[habit];
  }, [logs]);

  // Obtener límite para un hábito
  const getLimit = useCallback((habit: HabitType): number => {
    return HABIT_LIMITS[habit];
  }, []);

  // Obtener progreso como porcentaje
  const getProgress = useCallback((habit: HabitType): number => {
    const count = logs[habit];
    const limit = HABIT_LIMITS[habit];
    return (count / limit) * 100;
  }, [logs]);

  return {
    logs,
    hasReachedLimit,
    logHabit,
    getCount,
    getLimit,
    getProgress,
    HABIT_LIMITS,
  };
}
