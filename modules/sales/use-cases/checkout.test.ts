import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBatch, validateDataMock } = vi.hoisted(() => ({
  mockBatch: {
    set: vi.fn(),
    update: vi.fn(),
    commit: vi.fn()
  },
  validateDataMock: vi.fn()
}));

vi.mock("@/services/firebase/client", () => ({
  db: { __db: true }
}));

vi.mock("firebase/firestore", () => ({
  writeBatch: vi.fn(() => mockBatch),
  collection: vi.fn((...args: any[]) => ({ __type: "collection", path: args.join("/") })),
  doc: vi.fn((...args: any[]) => {
    if (args.length === 1 && args[0]?.__type === "collection") {
      return { __type: "doc", id: "new-sale-id" };
    }
    return { __type: "doc", path: args.join("/") };
  }),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
  increment: vi.fn((value: number) => ({ __increment: value }))
}));

vi.mock("@/app/schemas", () => ({
  validateData: validateDataMock,
  schemas: {
    venta: { __schema: "venta" }
  }
}));

import {
  validateCheckout,
  validateVentaSchema,
  checkoutCreate,
  checkoutEdit
} from "@/modules/sales/use-cases/checkout";

describe("validateCheckout", () => {
  it("falla en plan free al superar limite mensual", () => {
    const ventas = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      timestamp: { toDate: () => new Date() }
    })) as any;

    const error = validateCheckout({
      isPro: false,
      posForm: { id: null, cuentaId: "c1", cliente: "X" } as any,
      ventas,
      carrito: [{ id: "p1", cantidad: 1 }] as any
    });

    expect(error).toMatch(/mensual alcanzado/i);
  });

  it("falla si no hay cuenta", () => {
    const error = validateCheckout({
      isPro: true,
      posForm: { id: null, cuentaId: "", cliente: "X" } as any,
      ventas: [],
      carrito: [{ id: "p1", cantidad: 1 }] as any
    });

    expect(error).toBe("Debes seleccionar una cuenta de destino");
  });

  it("falla si carrito esta vacio en venta nueva", () => {
    const error = validateCheckout({
      isPro: true,
      posForm: { id: null, cuentaId: "c1", cliente: "X" } as any,
      ventas: [],
      carrito: [] as any
    });

    expect(error).toMatch(/carrito/i);
  });

  it("devuelve null cuando pasa validaciones", () => {
    const error = validateCheckout({
      isPro: true,
      posForm: { id: null, cuentaId: "c1", cliente: "X" } as any,
      ventas: [],
      carrito: [{ id: "p1", cantidad: 1 }] as any
    });

    expect(error).toBeNull();
  });
});

describe("validateVentaSchema", () => {
  beforeEach(() => {
    validateDataMock.mockReset();
  });

  it("no advierte cuando validacion es exitosa", () => {
    validateDataMock.mockReturnValue({ success: true, errors: {} });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    validateVentaSchema({ cliente: "Ana", cuentaId: "c1" } as any, [{ id: "p1", cantidad: 1 }] as any);

    expect(validateDataMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("advierte cuando la validacion retorna errores", () => {
    validateDataMock.mockReturnValue({ success: false, errors: { cliente: "Requerido" } });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    validateVentaSchema({ cliente: "", cuentaId: "c1" } as any, [{ id: "p1", cantidad: 1 }] as any);

    expect(warnSpy).toHaveBeenCalledWith("Validation warnings:", { cliente: "Requerido" });
    warnSpy.mockRestore();
  });

  it("captura excepciones del validador y advierte", () => {
    const error = new Error("schema exploded");
    validateDataMock.mockImplementation(() => {
      throw error;
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    validateVentaSchema({ cliente: "Ana", cuentaId: "c1" } as any, [{ id: "p1", cantidad: 1 }] as any);

    expect(warnSpy).toHaveBeenCalledWith("Validation error:", error);
    warnSpy.mockRestore();
  });
});

describe("checkoutCreate", () => {
  beforeEach(() => {
    mockBatch.set.mockClear();
    mockBatch.update.mockClear();
    mockBatch.commit.mockReset();
    mockBatch.commit.mockResolvedValue(undefined);
  });

  it("crea venta, movimiento y actualiza stock/cuenta", async () => {
    const result = await checkoutCreate({
      uid: "u1",
      carrito: [
        { id: "p1", cantidad: 2, precioUnitario: 5, costo: 3 } as any,
        { id: "p2", cantidad: 1, precioUnitario: 2, costo: 1 } as any
      ],
      ventas: [{ id: "v0" } as any],
      posForm: { cuentaId: "c1", cliente: "Cliente" } as any,
      cuentas: [{ id: "c1", nombre: "Caja" }] as any
    });

    expect(result.reciboId).toBe("0002");
    expect(result.totalFinal).toBe(12);
    expect(mockBatch.set).toHaveBeenCalled();
    expect(mockBatch.update).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("propaga error cuando falla batch.commit", async () => {
    mockBatch.commit.mockRejectedValueOnce(new Error("Firestore commit failed"));

    await expect(checkoutCreate({
      uid: "u1",
      carrito: [{ id: "p1", cantidad: 1, precioUnitario: 10, costo: 4 } as any],
      ventas: [],
      posForm: { cuentaId: "c1", cliente: "Cliente" } as any,
      cuentas: [{ id: "c1", nombre: "Caja" }] as any
    })).rejects.toThrow("Firestore commit failed");
  });
});

describe("checkoutEdit", () => {
  beforeEach(() => {
    mockBatch.set.mockClear();
    mockBatch.update.mockClear();
    mockBatch.commit.mockReset();
    mockBatch.commit.mockResolvedValue(undefined);
  });

  it("rechaza edicion para plan free", async () => {
    await expect(checkoutEdit({
      uid: "u1",
      isPro: false,
      posForm: { id: "v1", cuentaId: "c1", cliente: "X" } as any,
      ventas: [] as any,
      movimientos: [] as any,
      cuentas: [] as any
    })).rejects.toThrow(/PRO/);
  });

  it("actualiza cuenta y movimiento cuando cambia cuenta", async () => {
    await checkoutEdit({
      uid: "u1",
      isPro: true,
      posForm: { id: "v1", cuentaId: "c2", cliente: "Nuevo" } as any,
      ventas: [{ id: "v1", cuentaId: "c1", total: 100, reciboId: "0001" }] as any,
      movimientos: [{ id: "m1", ventaRefId: "v1" }] as any,
      cuentas: [{ id: "c2", nombre: "Banco" }] as any
    });

    expect(mockBatch.update).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("propaga error cuando falla batch.commit", async () => {
    mockBatch.commit.mockRejectedValueOnce(new Error("batch edit failed"));

    await expect(checkoutEdit({
      uid: "u1",
      isPro: true,
      posForm: { id: "v1", cuentaId: "c1", cliente: "Nuevo" } as any,
      ventas: [{ id: "v1", cuentaId: "c1", total: 100, reciboId: "0001" }] as any,
      movimientos: [{ id: "m1", ventaRefId: "v1" }] as any,
      cuentas: [{ id: "c1", nombre: "Caja" }] as any
    })).rejects.toThrow("batch edit failed");
  });
});



