import type { PhysicalProfile } from "@/modules/auth/types/user";
import { getTime } from "@/app/utils/helpers";

type WeightEntry = { peso?: number; timestamp?: unknown };

export function resolveCurrentWeight(
  history: WeightEntry[] = [],
  profile?: Pick<PhysicalProfile, "peso"> | null
): number | null {
  const latest = history
    .filter((entry) => Number.isFinite(entry?.peso) && Number(entry.peso) > 0)
    .sort((a, b) => getTime(b.timestamp as any) - getTime(a.timestamp as any))[0];

  return latest?.peso ? Number(latest.peso) : profile?.peso && profile.peso > 0 ? profile.peso : null;
}

export function getDailyExerciseMinutes(day: {
  ejercicioMinutos?: number;
  deficitCalorico?: { actividades?: Array<{ minutos?: number }> };
} | null | undefined): number {
  const activities = day?.deficitCalorico?.actividades;
  if (Array.isArray(activities)) {
    return activities.reduce((total, activity) => total + (Number(activity?.minutos) || 0), 0);
  }
  return Number(day?.ejercicioMinutos) || 0;
}
