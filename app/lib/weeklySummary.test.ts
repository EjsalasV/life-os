import { describe, expect, it } from "vitest";
import { getWeeklySummary } from "./weeklySummary";

describe("getWeeklySummary", () => {
  it("combina movimientos, ventas y progreso de mascota", () => {
    const now = new Date().toISOString();
    const summary = getWeeklySummary({
      movimientos: [
        { tipo: "INGRESO", monto: 100, timestamp: now },
        { tipo: "GASTO", monto: 20, timestamp: now }
      ],
      ventas: [{ total: 80, timestamp: now }],
      pet: { actividadHoy: { agua: 1, comidas: 1, habitos: 1 } },
      userStats: { currentStreak: 3 }
    } as any);

    expect(summary.income).toBe(100);
    expect(summary.expenses).toBe(20);
    expect(summary.salesIncome).toBe(80);
    expect(summary.totalActions).toBe(6);
    expect(summary.streak).toBe(3);
    expect(summary.milestone.label).toBe("Buen impulso");
  });
});
