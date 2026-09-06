import { describe, it, expect } from "vitest";
import { moneyCents, adjustedBalance } from "./money";
import { schemas } from "@/app/schemas";
describe("money input and arithmetic", () => {
  it.each(["Infinity", "12abc", "1,50", "", "0.001", NaN, Infinity, "9007199254740992"])("rejects invalid money %s", (input) => expect(() => moneyCents(input)).toThrow());
  it("preserves cents across additions and old floating point balances", () => {
    expect(moneyCents("1.01")).toBe(101);
    expect(adjustedBalance(0.1 + 0.2, -0.1)).toBe(0.2);
    expect(adjustedBalance(0.2, -0.2)).toBe(0);
  });
  it("accepts numeric values from stored products but rejects fractional stock", () => {
    const product = { nombre: "Café", precioVenta: 1.25, costo: 0.1, stock: 0 };
    expect(schemas.producto.safeParse(product).success).toBe(true);
    expect(schemas.producto.safeParse({ ...product, stock: "1.5" }).success).toBe(false);
    expect(schemas.producto.safeParse({ ...product, stock: "2abc" }).success).toBe(false);
  });
});
