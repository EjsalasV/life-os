import { describe, expect, it } from "vitest";
import { calcularBalanceMes, filtrarMesActual } from "./useDashboardDerivedMetrics";

const mov = (tipo: string, monto: number | string, timestamp?: Date) => ({
  tipo,
  monto,
  timestamp: timestamp ?? new Date()
});

describe("calcularBalanceMes", () => {
  it("suma ingresos y gastos por separado", () => {
    const r = calcularBalanceMes([
      mov("INGRESO", 100),
      mov("INGRESO", 50),
      mov("GASTO", 30)
    ]);
    expect(r.ingresos).toBe(150);
    expect(r.gastos).toBe(30);
    expect(r.balance).toBe(120);
    expect(r.proyeccion).toBe(120);
  });

  it("las transferencias y ahorros a meta son neutros", () => {
    const r = calcularBalanceMes([
      mov("INGRESO", 100),
      mov("TRANSFERENCIA", 40),
      mov("AHORRO_META", 25)
    ]);
    expect(r.ingresos).toBe(100);
    expect(r.gastos).toBe(0);
    expect(r.balance).toBe(100);
  });

  it("los fijos son informativos: no alteran balance ni proyección", () => {
    const r = calcularBalanceMes([mov("INGRESO", 100)], [{ monto: 60 }]);
    expect(r.gastosFijos).toBe(60);
    expect(r.balance).toBe(100);
    expect(r.proyeccion).toBe(100);
  });

  it("tolera montos string, nulos o inválidos", () => {
    const r = calcularBalanceMes([
      mov("INGRESO", "100.50"),
      mov("GASTO", null as unknown as number),
      mov("GASTO", "no-numero")
    ]);
    expect(r.ingresos).toBe(100.5);
    expect(r.gastos).toBe(0);
  });

  it("conjunto vacío produce ceros", () => {
    const r = calcularBalanceMes([]);
    expect(r).toMatchObject({ ingresos: 0, gastos: 0, balance: 0, proyeccion: 0, gastosFijos: 0 });
  });
});

describe("filtrarMesActual", () => {
  const ahora = new Date(2026, 5, 12); // 12 jun 2026

  it("incluye solo movimientos del mes calendario en curso", () => {
    const dentro = mov("GASTO", 10, new Date(2026, 5, 1));
    const finDeMes = mov("GASTO", 10, new Date(2026, 5, 30, 23, 59));
    const mesAnterior = mov("GASTO", 10, new Date(2026, 4, 31, 23, 59));
    const mesSiguiente = mov("GASTO", 10, new Date(2026, 6, 1, 0, 0));

    const r = filtrarMesActual([dentro, finDeMes, mesAnterior, mesSiguiente], ahora);
    expect(r).toEqual([dentro, finDeMes]);
  });

  it("un movimiento con timestamp pendiente (null) cuenta como del mes actual", () => {
    // getTime(null) devuelve Date.now(): el doc recién creado offline no debe desaparecer
    const pendiente = { tipo: "GASTO", monto: 5, timestamp: null };
    const r = filtrarMesActual([pendiente], new Date());
    expect(r).toHaveLength(1);
  });
});
