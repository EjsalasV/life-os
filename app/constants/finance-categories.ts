import type { Categoria } from "@/app/types";

/** Metadata sin dependencias de UI, reutilizable desde cliente y servidor. */
export const FINANCE_CATEGORY_METADATA = [
  { id: "comida", label: "Alimentación", emoji: "🍽️" },
  { id: "transporte", label: "Transporte", emoji: "🚗" },
  { id: "entretenimiento", label: "Ocio", emoji: "🎮" },
  { id: "salud", label: "Salud", emoji: "❤️‍🩹" },
  { id: "educacion", label: "Educación", emoji: "📚" },
  { id: "servicios", label: "Hogar", emoji: "🏠" },
  { id: "otros", label: "Otros", emoji: "📦" }
] as const satisfies ReadonlyArray<{ id: Categoria; label: string; emoji: string }>;

export type FinanceCategoryId = (typeof FINANCE_CATEGORY_METADATA)[number]["id"];

export function isFinanceCategoryId(value: unknown): value is FinanceCategoryId {
  return FINANCE_CATEGORY_METADATA.some((category) => category.id === value);
}
