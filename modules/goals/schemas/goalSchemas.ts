import { z } from "zod";
import { isGoalDate } from "../domain/goalDates";

const optionalText = (max: number) => z.preprocess(
  (value) => value === undefined ? undefined : typeof value === "string" ? value.trim() : value,
  z.string().min(1).max(max)
).optional();

const goalUnitSchema = optionalText(30);
const finiteNumber = z.number().finite();

export const goalAreaSchema = z.enum(["health", "finance", "education", "work", "business", "habits", "personal"]);
export const goalStatusSchema = z.enum(["active", "paused", "completed", "canceled"]);
export const goalDirectionSchema = z.enum(["increase", "decrease"]);
export const goalDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isGoalDate, "La fecha objetivo no es válida.");

const numericFields = {
  unit: goalUnitSchema,
  direction: goalDirectionSchema,
  initialValue: finiteNumber,
  currentValue: finiteNumber,
  targetValue: finiteNumber
};

function validateDirection(value: { direction: "increase" | "decrease"; initialValue: number; targetValue: number }, ctx: z.RefinementCtx): void {
  const valid = value.direction === "increase" ? value.targetValue > value.initialValue : value.targetValue < value.initialValue;
  if (!valid) ctx.addIssue({ code: "custom", path: ["targetValue"], message: "El objetivo no coincide con la dirección del indicador." });
}

export const numberGoalIndicatorSchema = z.object({ type: z.literal("number"), ...numericFields }).strict().superRefine(validateDirection);

export const countGoalIndicatorSchema = z.object({ type: z.literal("count"), ...numericFields })
  .strict()
  .superRefine((value, ctx) => {
    if (![value.initialValue, value.currentValue, value.targetValue].every(Number.isInteger)) {
      ctx.addIssue({ code: "custom", path: ["currentValue"], message: "Los indicadores count deben usar enteros." });
    }
    if ([value.initialValue, value.currentValue, value.targetValue].some((item) => item < 0)) {
      ctx.addIssue({ code: "custom", path: ["currentValue"], message: "Los indicadores count no pueden ser negativos." });
    }
    validateDirection(value, ctx);
  });

export const percentageGoalIndicatorSchema = z.object({ type: z.literal("percentage"), ...numericFields })
  .strict()
  .superRefine((value, ctx) => {
    if ([value.initialValue, value.currentValue, value.targetValue].some((item) => item < 0 || item > 100)) {
      ctx.addIssue({ code: "custom", path: ["currentValue"], message: "Los porcentajes deben estar entre 0 y 100." });
    }
    validateDirection(value, ctx);
  });

export const booleanGoalIndicatorSchema = z.object({
  type: z.literal("boolean"),
  currentValue: z.boolean(),
  targetValue: z.literal(true)
}).strict();

export const goalIndicatorSchema = z.discriminatedUnion("type", [
  numberGoalIndicatorSchema,
  countGoalIndicatorSchema,
  percentageGoalIndicatorSchema,
  booleanGoalIndicatorSchema
]);

const goalTextFields = {
  name: z.string().trim().min(1).max(120),
  area: goalAreaSchema,
  reason: optionalText(500),
  expectedOutcome: optionalText(500),
  targetDate: goalDateSchema.optional(),
  nextAction: optionalText(240),
  obstacles: z.array(z.string().trim().min(1).max(200)).max(5).optional()
};

export const createGoalSchema = z.object({
  ...goalTextFields,
  indicator: goalIndicatorSchema
}).strict();

export const updateGoalSchema = z.object({
  ...goalTextFields,
  indicator: goalIndicatorSchema.optional()
}).partial().strict().refine((value) => Object.keys(value).length > 0, "Debes enviar al menos un campo editable.");

export const updateGoalProgressSchema = z.object({
  currentValue: z.union([z.number().finite(), z.boolean()])
}).strict();
