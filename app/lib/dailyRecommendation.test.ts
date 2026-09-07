import { describe, expect, it } from "vitest";
import { getDailyRecommendation } from "./dailyRecommendation";

describe("getDailyRecommendation", () => {
  it("prioriza hidratacion cuando la mascota tiene sed", () => {
    expect(getDailyRecommendation({ pet: { sed: 80 } }).key).toBe("hydration");
  });

  it("propone registrar una venta cuando el negocio esta vacio", () => {
    expect(getDailyRecommendation({ pet: {}, ventas: [] }).key).toBe("first-sale");
  });

  it("propone revisar un gasto registrado hoy", () => {
    const now = new Date().toISOString();
    const result = getDailyRecommendation({
      pet: {},
      ventas: [{ timestamp: now }],
      movimientos: [{ tipo: "GASTO", monto: 20, timestamp: now }]
    } as any);
    expect(result.key).toBe("review-spend");
  });

  it("respeta el enfoque de negocio cuando ya existen ventas", () => {
    const result = getDailyRecommendation({
      enfoque: "negocio",
      ventas: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), total: 40 }]
    } as any);
    expect(result.key).toBe("business-check");
  });
});
