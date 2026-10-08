import type { z } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => { errors[issue.path.join(".") || "general"] = issue.message; });
  return { success: false, errors };
}
