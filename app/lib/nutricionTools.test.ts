import { describe, expect, it } from "vitest";
import { AlimentosBase } from "@/app/constants/alimentos-base";
import {
  buildMealTemplatesFromHistory,
  getNutritionGoalSnapshot,
  parseNaturalMealInput,
  scaleNutrients
} from "./nutricionTools";

describe("nutricionTools", () => {
  it("escala nutrientes por cantidad y unidad", () => {
    const scaled = scaleNutrients(AlimentosBase["huevo"], 2, "unidad");

    expect(scaled.calorias).toBe(310);
    expect(scaled.proteina).toBe(26);
    expect(scaled.grasas).toBe(22);
  });

  it("descompone texto natural y detecta el tiempo de comida", () => {
    const parsed = parseNaturalMealInput("desayuné 2 huevos y 1 plátano", AlimentosBase, "almuerzo");

    expect(parsed.mealType).toBe("desayuno");
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].match?.id).toBe("huevo");
    expect(parsed.items[0].quantity).toBe(2);
    expect(parsed.items[0].unit).toBe("unidad");
    expect(parsed.items[1].match?.id).toBe("platano");
    expect(parsed.items[1].needsReview).toBe(false);
  });

  it("calcula metas nutricionales personalizadas cuando hay perfil", () => {
    const goal = getNutritionGoalSnapshot(
      { uid: "test", email: "test@example.com", name: "Test", plan: "pro" },
      {
        peso: 75,
        altura: 175,
        edad: 30,
        sexo: "hombre",
        nivelActividad: "moderado",
        objetivo: "perdida-grasa"
      }
    );

    expect(goal.source).toBe("perfil");
    expect(goal.calorias).toBe(2133);
    expect(goal.proteina).toBe(135);
    expect(goal.carbohidratos).toBe(263);
  });

  it("agrupa plantillas frecuentes a partir del historial", () => {
    const templates = buildMealTemplatesFromHistory([
      {
        fecha: "2026-09-06",
        alimentos: [
          {
            id: "1",
            alimentoId: "huevo-1",
            nombre: "Huevo",
            tipo: "desayuno",
            cantidad: 2,
            unidad: "unidad",
            hora: "08:00",
            caloriasTotales: 310,
            nutrientes: AlimentosBase["huevo"],
            impactoBateria: 12
          }
        ]
      },
      {
        fecha: "2026-09-05",
        alimentos: [
          {
            id: "2",
            alimentoId: "huevo-2",
            nombre: "Huevo",
            tipo: "desayuno",
            cantidad: 2,
            unidad: "unidad",
            hora: "08:00",
            caloriasTotales: 310,
            nutrientes: AlimentosBase["huevo"],
            impactoBateria: 12
          }
        ]
      }
    ]);

    expect(templates).toHaveLength(1);
    expect(templates[0].uses).toBe(2);
    expect(templates[0].mealType).toBe("desayuno");
  });
});
