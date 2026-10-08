import { describe, expect, it } from "vitest";
import { productoSchema, ventaSchema } from "./salesSchemas";

describe("sales schemas", () => {
  it("validates product price, cost and stock", () => {
    expect(productoSchema.safeParse({ nombre: "Café", precioVenta: "10", costo: "5", stock: "2" }).success).toBe(true);
    expect(productoSchema.safeParse({ nombre: "Café", precioVenta: "4", costo: "5", stock: "2" }).success).toBe(false);
    expect(productoSchema.safeParse({ nombre: "Café", precioVenta: "10", costo: "5", stock: "2.5" }).success).toBe(false);
  });
  it("requires the sale account and at least one valid item", () => {
    const item = { id: "p1", nombre: "Café", cantidad: 1, precioUnitario: 10, subtotal: 10 };
    expect(ventaSchema.safeParse({ cliente: "Cliente", cuentaId: "cash", items: [item] }).success).toBe(true);
    expect(ventaSchema.safeParse({ cliente: "Cliente", cuentaId: "", items: [] }).success).toBe(false);
  });
});
