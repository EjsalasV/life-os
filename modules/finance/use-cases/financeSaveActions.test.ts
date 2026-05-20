import { beforeEach, describe, expect, it, vi } from "vitest";

const { financeServiceMock, validateDataMock } = vi.hoisted(() => ({
  financeServiceMock: {
    addEntity: vi.fn(),
    updateEntity: vi.fn(),
    updateCuentaMonto: vi.fn(),
    updateMetaMontoActual: vi.fn(),
    addMovimiento: vi.fn(),
    timestamp: vi.fn(() => "SERVER_TS")
  },
  validateDataMock: vi.fn()
}));

vi.mock("@/modules/finance/services/financeService", () => ({
  financeService: financeServiceMock
}));

vi.mock("@/app/schemas", () => ({
  validateData: validateDataMock,
  schemas: {
    producto: { __schema: "producto" },
    movimiento: { __schema: "movimiento" },
    cuenta: { __schema: "cuenta" },
    peso: { __schema: "peso" }
  }
}));

import {
  saveMovimiento,
  saveTransferencia,
  savePresupuesto,
  saveProducto,
  saveCuenta,
  saveMeta,
  saveHabito,
  saveAhorroMeta,
  saveFijo,
  savePeso
} from "@/modules/finance/use-cases/financeSaveActions";

const baseCtx = {
  uid: "u1",
  isPro: true,
  cuentas: [
    { id: "c1", nombre: "Caja" },
    { id: "c2", nombre: "Banco" }
  ],
  productosCount: 0,
  financeForm: {
    nombre: "Ingreso prueba",
    monto: "100",
    tipo: "INGRESO",
    cuentaId: "c1",
    cuentaDestinoId: "",
    categoria: "otros",
    periodicidad: "Mensual",
    diaCobro: "1",
    limite: "",
    metaId: "m1"
  },
  productForm: {
    id: undefined,
    nombre: "Prod",
    precioVenta: "10",
    costo: "4",
    stock: "5"
  },
  healthForm: {
    nombre: "Habito",
    frecuencia: "Diario",
    iconType: "pill",
    peso: "70"
  },
  updateStreakExternal: vi.fn(async () => true)
} as any;

describe("financeSaveActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateDataMock.mockReset();
    validateDataMock.mockReturnValue({ success: true, errors: {} });
  });

  it("saveMovimiento actualiza cuenta y crea movimiento", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "GASTO",
        monto: "50",
        categoria: "comida"
      }
    });

    expect(financeServiceMock.updateCuentaMonto).toHaveBeenCalledWith("u1", "c1", -50);
    expect(financeServiceMock.addMovimiento).toHaveBeenCalled();
    expect(baseCtx.updateStreakExternal).toHaveBeenCalled();
  });

  it("saveTransferencia falla si cuenta origen y destino son iguales", async () => {
    await expect(saveTransferencia({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        monto: "20",
        cuentaId: "c1",
        cuentaDestinoId: "c1"
      }
    })).rejects.toThrow("misma cuenta");
  });

  it("saveTransferencia actualiza ambas cuentas y movimiento", async () => {
    await saveTransferencia({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        monto: "20",
        cuentaId: "c1",
        cuentaDestinoId: "c2"
      }
    });

    expect(financeServiceMock.updateCuentaMonto).toHaveBeenNthCalledWith(1, "u1", "c1", -20);
    expect(financeServiceMock.updateCuentaMonto).toHaveBeenNthCalledWith(2, "u1", "c2", 20);
    expect(financeServiceMock.addMovimiento).toHaveBeenCalled();
  });

  it("savePresupuesto guarda categoria y limite", async () => {
    await savePresupuesto({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        categoria: "salud",
        limite: "300"
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "presupuestos",
      expect.objectContaining({ categoria: "salud", limite: 300 })
    );
  });

  it("saveProducto crea producto valido", async () => {
    await saveProducto({
      ...baseCtx,
      isPro: false,
      productosCount: 0,
      productForm: {
        nombre: "Café",
        precioVenta: "12",
        costo: "6",
        stock: "10"
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "productos",
      expect.objectContaining({ nombre: "Café", precioVenta: 12, costo: 6, stock: 10 })
    );
  });

  it("saveProducto rechaza limite de plan free", async () => {
    await expect(saveProducto({
      ...baseCtx,
      isPro: false,
      productosCount: 5,
      productForm: {
        nombre: "Nuevo",
        precioVenta: "10",
        costo: "4",
        stock: "2"
      }
    })).rejects.toThrow(/5 productos/);
  });

  it("saveCuenta rechaza cuando plan free supera limite de cuentas", async () => {
    await expect(saveCuenta({
      ...baseCtx,
      isPro: false,
      cuentas: [{ id: "c1", nombre: "Caja" }, { id: "c2", nombre: "Banco" }]
    })).rejects.toThrow(/2 cuentas/);
  });

  it("saveCuenta propaga primer error de validacion", async () => {
    validateDataMock.mockReturnValueOnce({ success: false, errors: { nombre: "Nombre requerido" } });

    await expect(saveCuenta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        nombre: ""
      }
    })).rejects.toThrow("Nombre requerido");
  });

  it("saveCuenta guarda cuenta valida", async () => {
    await saveCuenta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        nombre: "Ahorros",
        monto: "250"
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "cuentas",
      expect.objectContaining({ nombre: "Ahorros", monto: 250, timestamp: "SERVER_TS" })
    );
  });

  it("saveMeta guarda meta con monto objetivo y montoActual en cero", async () => {
    await saveMeta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        nombre: "Viaje",
        monto: "5000"
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "metas",
      expect.objectContaining({ nombre: "Viaje", montoObjetivo: 5000, montoActual: 0 })
    );
  });

  it("saveHabito usa defaults cuando faltan frecuencia e icono", async () => {
    await saveHabito({
      ...baseCtx,
      healthForm: {
        ...baseCtx.healthForm,
        frecuencia: "",
        iconType: ""
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "habitos",
      expect.objectContaining({ frecuencia: "Diario", iconType: "pill" })
    );
  });

  it("saveAhorroMeta falla si falta cuenta", async () => {
    await expect(saveAhorroMeta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        cuentaId: ""
      }
    })).rejects.toThrow("Selecciona una cuenta");
  });

  it("saveAhorroMeta falla si falta metaId", async () => {
    await expect(saveAhorroMeta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        metaId: ""
      }
    })).rejects.toThrow("No se selecciono una meta");
  });

  it("saveAhorroMeta descuenta cuenta, suma meta y registra movimiento", async () => {
    await saveAhorroMeta({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        cuentaId: "c1",
        metaId: "m1",
        monto: "120"
      }
    });

    expect(financeServiceMock.updateCuentaMonto).toHaveBeenCalledWith("u1", "c1", -120);
    expect(financeServiceMock.updateMetaMontoActual).toHaveBeenCalledWith("u1", "m1", 120);
    expect(financeServiceMock.addMovimiento).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ tipo: "AHORRO_META", metaId: "m1", monto: 120 })
    );
  });

  it("saveFijo guarda periodicidad y dia por defecto", async () => {
    await saveFijo({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        periodicidad: "",
        diaCobro: ""
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "fijos",
      expect.objectContaining({ periodicidad: "Mensual", diaCobro: "1" })
    );
  });

  it("savePeso rechaza si no es PRO", async () => {
    await expect(savePeso({
      ...baseCtx,
      isPro: false
    })).rejects.toThrow(/PRO/);
  });

  it("savePeso propaga error de validacion", async () => {
    validateDataMock.mockReturnValueOnce({ success: false, errors: { peso: "Peso inválido" } });

    await expect(savePeso({
      ...baseCtx,
      isPro: true,
      healthForm: {
        ...baseCtx.healthForm,
        peso: ""
      }
    })).rejects.toThrow(/Peso/);
  });

  it("savePeso guarda registro cuando validacion es correcta", async () => {
    await savePeso({
      ...baseCtx,
      isPro: true,
      healthForm: {
        ...baseCtx.healthForm,
        peso: "72"
      }
    });

    expect(financeServiceMock.addEntity).toHaveBeenCalledWith(
      "u1",
      "peso",
      expect.objectContaining({ peso: 72, timestamp: "SERVER_TS" })
    );
  });
});




