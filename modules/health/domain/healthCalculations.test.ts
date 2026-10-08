import { describe, expect, it } from "vitest";
import { analizarMacros, calculateBattery, createInitialSaludData } from "./healthCalculations";

describe("health domain calculations", () => {
  it("creates the same empty daily shape used by persistence", () => {
    const data = createInitialSaludData();
    expect(data.alimentos).toEqual([]);
    expect(data.habitosChecks).toEqual([]);
    expect(data.bateria).toBe(10);
    expect(data.comidas).toEqual({});
  });

  it("calculates macros without mutating food entries", () => {
    const food = {
      id: "food-1", alimentoId: "base-1", nombre: "Avena", tipo: "desayuno" as const,
      cantidad: 1, unidad: "porción", hora: "08:00", caloriasTotales: 300, impactoBateria: 2,
      nutrientes: { id: "n-1", nombre: "Avena", calorias: 300, proteina: 10, carbohidratos: 50, grasas: 5, fibra: 8, vitaminas: { B1: 1 }, minerales: { Hierro: 2 } }
    };
    expect(analizarMacros([food])).toMatchObject({ caloriasTotales: 300, proteinaTotal: 10, carbohidratosTotal: 50, grasasTotal: 5, vitaminasConsumo: { B1: 1 }, mineralesConsumo: { Hierro: 2 } });
    expect(food.nutrientes.proteina).toBe(10);
  });

  it("keeps battery bounded and includes completed activities", () => {
    expect(calculateBattery({ animo: "genial", agua: 20, habitosChecks: ["a", "b"], ejercicioMinutos: 30, comidas: {} })).toBe(100);
    expect(calculateBattery({ animo: "mal", agua: 0, habitosChecks: [], ejercicioMinutos: 0, comidas: {} })).toBe(0);
  });
});
