import { z } from "zod";
import { ActividadesQuemadas } from "@/app/constants/deficit-calorico";

export const physicalProfileSchema = z.object({
  peso: z.number().finite().positive().max(500),
  altura: z.number().finite().positive().max(300),
  edad: z.number().int().min(1).max(120),
  sexo: z.enum(["hombre", "mujer"]),
  nivelActividad: z.preprocess(
    (value) => value === "activo" ? "intenso" : value === "muy-activo" ? "muy-intenso" : value,
    z.enum(["sedentario", "ligero", "moderado", "intenso", "muy-intenso"])
  ),
  objetivo: z.preprocess(
    (value) => value === "ganancia-musculo" ? "ganancia-muscular" : value,
    z.enum(["perdida-grasa", "mantenimiento", "ganancia-muscular"])
  ),
  pesoObjetivo: z.number().finite().positive().max(500)
});

export const activitySchema = z.object({
  id: z.union([z.string(), z.number()]),
  tipo: z.string().min(1).refine((value) => value in ActividadesQuemadas, "Actividad no reconocida"),
  minutos: z.number().finite().positive().max(1440),
  calorias: z.number().finite().nonnegative()
});

export const activityListSchema = z.array(activitySchema);

export const healthStatSchema = z.object({
  agua: z.number().int().min(0).max(20),
  animo: z.enum(["mal", "normal", "genial"]),
  ejercicioMinutos: z.number().finite().min(0).max(1440),
  suenoHoras: z.number().finite().min(0).max(24),
  calidadSueno: z.enum(["mala", "regular", "buena", "excelente"]),
  estres: z.number().finite().min(0).max(100)
}).partial().strict();

export const mealTypeSchema = z.enum(["desayuno", "almuerzo", "merienda", "cena", "snack"]);
export const mealQualitySchema = z.enum(["nutritivo", "normal", "procesado"]);

export const foodSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  caloriasTotales: z.number().finite().nonnegative(),
  nutrientes: z.object({
    proteina: z.number().finite().nonnegative(),
    carbohidratos: z.number().finite().nonnegative(),
    grasas: z.number().finite().nonnegative(),
    vitaminas: z.record(z.string(), z.number().finite().nonnegative()),
    minerales: z.record(z.string(), z.number().finite().nonnegative())
  }).passthrough()
}).passthrough();

export const habitoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"),
  frecuencia: z.enum(["Diario", "Semanal", "Mensual"]),
  iconType: z.string().min(1).max(50),
  activo: z.boolean().optional(),
  archivedAt: z.unknown().nullable().optional()
});

export const pesoSchema = z.object({
  peso: z.union([z.string(), z.number().finite()]).transform(String).refine((value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 && number < 500;
  }, "El peso debe estar entre 0 y 500 kg")
});

export const healthWaterIntegrationSchema = z.object({
  action: z.enum(["ADD", "REMOVE", "SET"]),
  amount: z.number().int().min(0).max(20).optional(),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).strict().superRefine((value, ctx) => {
  if (value.action === "SET" && value.amount === undefined) {
    ctx.addIssue({ code: "custom", path: ["amount"], message: "SET requiere amount." });
  }
});

export const healthCheckInIntegrationSchema = z.object({
  sleepHours: z.number().finite().min(0).max(24).optional(),
  sleepQuality: z.enum(["mala", "regular", "buena", "excelente"]).optional(),
  mood: z.enum(["mal", "normal", "genial"]).optional(),
  stress: z.number().finite().min(0).max(100).optional(),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).strict().refine(
  (value) => value.sleepHours !== undefined || value.sleepQuality !== undefined || value.mood !== undefined || value.stress !== undefined,
  { message: "Debes enviar al menos un campo del check-in." }
);

export const healthActivityIntegrationSchema = z.object({
  type: z.string().trim().min(1).refine((value) => value in ActividadesQuemadas, "Actividad no reconocida."),
  minutes: z.number().finite().positive().max(1440),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).strict();

export const healthHabitCheckIntegrationSchema = z.object({
  habitId: z.string().trim().min(1).max(150),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).strict();

export const healthWeightIntegrationSchema = z.object({
  weight: z.number().finite().positive().max(500),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).strict();
