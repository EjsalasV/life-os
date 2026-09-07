"use client";

import { useCallback, useMemo } from "react";
import { z } from "zod";
import { useStoredValue } from "./useStoredValue";
import type { AlimentoRegistrado } from "@/app/types";
import {
  buildMealTemplatesFromHistory,
  createMealTemplateFromItems,
  mergeMealTemplates,
  type MealTemplate,
  type MealType,
  MEAL_TYPES
} from "@/app/lib/nutricionTools";

const templateSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  mealType: z.enum(MEAL_TYPES),
  signature: z.string().min(1),
  source: z.enum(["historico", "guardado"]),
  uses: z.number().finite().nonnegative(),
  lastUsedAt: z.string().min(1),
  items: z.array(
    z.object({
      alimentoId: z.string().min(1),
      nombre: z.string().min(1),
      cantidad: z.number().finite().positive(),
      unidad: z.string().min(1),
      tipo: z.enum(MEAL_TYPES),
      caloriasTotales: z.number().finite().nonnegative(),
      nutrientes: z.any()
    })
  ),
  totals: z.object({
    calorias: z.number().finite().nonnegative(),
    proteina: z.number().finite().nonnegative(),
    carbohidratos: z.number().finite().nonnegative(),
    grasas: z.number().finite().nonnegative(),
    fibra: z.number().finite().nonnegative()
  })
});

const emptyTemplates: MealTemplate[] = [];
const isMealTemplates = (value: unknown): value is MealTemplate[] => Array.isArray(value) && value.every((item) => templateSchema.safeParse(item).success);

export function useNutritionTemplates(userId?: string, saludHoy?: { fecha?: string; alimentos?: AlimentoRegistrado[] } | null, historialSalud?: Array<{ fecha: string; alimentos?: AlimentoRegistrado[] }>) {
  const storageKey = `nutrition-templates-${userId || "main"}`;
  const [savedTemplates, setSavedTemplates, storageError] = useStoredValue(storageKey, emptyTemplates, isMealTemplates);

  const historicalTemplates = useMemo(() => buildMealTemplatesFromHistory([
    ...(saludHoy?.fecha ? [{ fecha: saludHoy.fecha, alimentos: saludHoy.alimentos || [] }] : []),
    ...(historialSalud || [])
  ]), [saludHoy, historialSalud]);

  const templates = useMemo(
    () => mergeMealTemplates(savedTemplates, historicalTemplates),
    [savedTemplates, historicalTemplates]
  );

  const templatesByMeal = useMemo(() => {
    return templates.reduce<Record<MealType, MealTemplate[]>>((acc, template) => {
      acc[template.mealType].push(template);
      return acc;
    }, {
      desayuno: [],
      almuerzo: [],
      merienda: [],
      cena: [],
      snack: []
    });
  }, [templates]);

  const saveTemplate = useCallback((
    mealType: MealType,
    items: AlimentoRegistrado[],
    name?: string
  ) => {
    const template = createMealTemplateFromItems(mealType, items, name);
    if (!template) return null;
    setSavedTemplates((current) => {
      const next = current.filter((item) => item.signature !== template.signature);
      return [template, ...next].slice(0, 12);
    });
    return template;
  }, [setSavedTemplates]);

  const removeTemplate = useCallback((signature: string) => {
    setSavedTemplates((current) => current.filter((template) => template.signature !== signature));
  }, [setSavedTemplates]);

  const touchTemplate = useCallback((signature: string) => {
    setSavedTemplates((current) => current.map((template) => template.signature === signature
      ? { ...template, uses: template.uses + 1, lastUsedAt: new Date().toISOString() }
      : template
    ));
  }, [setSavedTemplates]);

  return {
    templates,
    templatesByMeal,
    historicalTemplates,
    savedTemplates,
    storageError,
    saveTemplate,
    removeTemplate,
    touchTemplate
  };
}
