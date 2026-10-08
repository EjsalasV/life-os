import { safeHealthNumber } from "@/modules/health/domain/healthNumbers";
import { habitoSchema, pesoSchema } from "@/modules/health/schemas/healthSchemas";
import { healthService } from "@/modules/health/services/healthService";
import type { HealthActionContext } from "@/modules/health/types/healthActionTypes";

function firstValidationError(errors: Record<string, string>): string {
  return String(Object.values(errors)[0] || "Datos inválidos");
}

export async function savePeso(ctx: HealthActionContext): Promise<void> {
  if (!ctx.isPro) throw new Error("Seguimiento de peso es función PRO 💎");

  const result = pesoSchema.safeParse(ctx.healthForm);
  if (!result.success) throw new Error(result.error.issues[0]?.message || "Peso inválido");

  await healthService.addWeight(ctx.uid, safeHealthNumber(ctx.healthForm.peso));
}

export async function saveHabito(ctx: HealthActionContext): Promise<void> {
  const payload = {
    nombre: ctx.healthForm.nombre,
    frecuencia: ctx.healthForm.frecuencia || "Diario",
    iconType: ctx.healthForm.iconType || "pill",
    activo: true,
    archivedAt: null,
    timestamp: healthService.timestamp(),
    createdAt: healthService.timestamp()
  };

  const result = habitoSchema.safeParse(payload);
  if (!result.success) {
    const errors = Object.fromEntries(result.error.issues.map((issue) => [issue.path.join(".") || "general", issue.message]));
    throw new Error(firstValidationError(errors));
  }

  await healthService.addHabit(ctx.uid, payload);
}
