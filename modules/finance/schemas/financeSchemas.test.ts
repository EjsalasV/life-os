import { describe, expect, it } from "vitest";
import { cuentaSchema, metaSchema, movimientoSchema, presupuestoSchema } from "./financeSchemas";

describe("finance schemas", () => {
  it("accepts a valid movement and rejects invalid amounts", () => {
    expect(movimientoSchema.safeParse({ nombre: "Café", monto: "5", tipo: "GASTO", cuentaId: "cash", categoria: "comida" }).success).toBe(true);
    expect(movimientoSchema.safeParse({ nombre: "Café", monto: "0", tipo: "GASTO", cuentaId: "cash", categoria: "comida" }).success).toBe(false);
  });
  it("requires a destination for transfers", () => {
    expect(movimientoSchema.safeParse({ nombre: "Mover", monto: "10", tipo: "TRANSFERENCIA", cuentaId: "cash", categoria: "otros" }).success).toBe(false);
    expect(movimientoSchema.safeParse({ nombre: "Mover", monto: "10", tipo: "TRANSFERENCIA", cuentaId: "cash", cuentaDestinoId: "bank", categoria: "otros" }).success).toBe(true);
  });
  it("keeps account, goal and budget constraints", () => {
    expect(cuentaSchema.safeParse({ nombre: "Caja", monto: "0" }).success).toBe(true);
    expect(metaSchema.safeParse({ nombre: "Viaje", montoObjetivo: "100" }).success).toBe(true);
    expect(presupuestoSchema.safeParse({ categoria: "comida", limite: "100" }).success).toBe(true);
  });
});
