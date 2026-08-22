import { beforeEach, describe, expect, it, vi } from "vitest";

const { financeServiceMock, validateDataMock, editMovementWithBalanceMock } = vi.hoisted(() => ({
  financeServiceMock: {
    addEntity: vi.fn(),
    updateEntity: vi.fn(),
    updateCuentaMonto: vi.fn(),
    updateMetaMontoActual: vi.fn(),
    addMovimiento: vi.fn(),
    registrarMovimientoConSaldo: vi.fn(),
    transferirEntreCuentas: vi.fn(),
    aportarAhorroMeta: vi.fn(),
    timestamp: vi.fn(() => "SERVER_TS")
  },
  validateDataMock: vi.fn(),
  editMovementWithBalanceMock: vi.fn()
}));

vi.mock("@/modules/finance/services/financeService", () => ({
  financeService: financeServiceMock
}));

vi.mock("@/modules/finance/services/financeTransactionService", () => ({
  editMovementWithBalance: editMovementWithBalanceMock
}));

vi.mock("@/app/schemas", () => ({
  validateData: validateDataMock,
  schemas: {
    producto: { __schema: "producto" },
    movimiento: { __schema: "movimiento" },
    cuenta: { __schema: "cuenta" },
    peso: { __schema: "peso" },
    fijo: { __schema: "fijo" },
    meta: { __schema: "meta" },
    habito: { __schema: "habito" }
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

  it("saveMovimiento actualiza cuenta y crea movimiento en un solo batch", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "GASTO",
        monto: "50",
        categoria: "comida"
      }
    });

    expect(financeServiceMock.registrarMovimientoConSaldo).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        cuentaId: "c1",
        delta: -50,
        movimiento: expect.objectContaining({ monto: 50, tipo: "GASTO" })
      })
    );
    expect(baseCtx.updateStreakExternal).toHaveBeenCalled();
  });

  it("saveMovimiento edita un movimiento existente sin crear uno nuevo", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        id: "mov-1",
        tipo: "GASTO",
        monto: "80",
        categoria: "salud"
      }
    });

    expect(editMovementWithBalanceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "u1",
        movementId: "mov-1",
        monto: 80,
        tipo: "GASTO",
        cuentaId: "c1",
        categoria: "salud"
      })
    );
    expect(financeServiceMock.registrarMovimientoConSaldo).not.toHaveBeenCalled();
    expect(baseCtx.updateStreakExternal).not.toHaveBeenCalled();
  });

  it("saveMovimiento persiste SOLO los campos del movimiento (sin basura del formulario)", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "GASTO",
        monto: "25",
        categoria: "comida",
        // Campos de otros formularios que NO deben persistirse:
        periodicidad: "Mensual",
        diaCobro: "15",
        limite: "300",
        cuentaDestinoId: "c2"
      }
    });

    const { movimiento } = financeServiceMock.registrarMovimientoConSaldo.mock.calls[0][1];

    expect(Object.keys(movimiento).sort()).toEqual([
      "categoria", "cuentaId", "cuentaNombre", "monto", "nombre", "tipo", "timestamp"
    ].sort());
    expect(movimiento).toMatchObject({
      nombre: "Ingreso prueba",
      monto: 25,
      tipo: "GASTO",
      categoria: "comida",
      cuentaId: "c1",
      cuentaNombre: "Caja"
    });
    expect(movimiento.timestamp).toBeInstanceOf(Date);
  });

  it("saveMovimiento respeta la fecha elegida en el formulario (mediodía local)", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "INGRESO",
        monto: "10",
        fecha: "2026-06-10"
      }
    });

    const { movimiento } = financeServiceMock.registrarMovimientoConSaldo.mock.calls[0][1];
    expect(movimiento.timestamp.getFullYear()).toBe(2026);
    expect(movimiento.timestamp.getMonth()).toBe(5); // junio
    expect(movimiento.timestamp.getDate()).toBe(10);
    expect(movimiento.timestamp.getHours()).toBe(12);
  });

  it("saveMovimiento usa la fecha actual si la fecha es inválida o falta", async () => {
    const antes = Date.now();
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "INGRESO",
        monto: "10",
        fecha: "no-es-fecha"
      }
    });

    const { movimiento } = financeServiceMock.registrarMovimientoConSaldo.mock.calls[0][1];
    expect(movimiento.timestamp.getTime()).toBeGreaterThanOrEqual(antes);
  });

  it("saveMovimiento usa categoria 'otros' por defecto", async () => {
    await saveMovimiento({
      ...baseCtx,
      financeForm: {
        ...baseCtx.financeForm,
        tipo: "INGRESO",
        monto: "10",
        categoria: ""
      }
    });

    const { movimiento } = financeServiceMock.registrarMovimientoConSaldo.mock.calls[0][1];
    expect(movimiento.categoria).toBe("otros");
  });

  it("saveTransferencia rechaza monto cero o negativo", async () => {
    await expect(saveTransferencia({
      ...baseCtx,
      financeForm: { ...baseCtx.financeForm, monto: "0", cuentaId: "c1", cuentaDestinoId: "c2" }
    })).rejects.toThrow(/mayor a 0/);

    await expect(saveTransferencia({
      ...baseCtx,
      financeForm: { ...baseCtx.financeForm, monto: "-5", cuentaId: "c1", cuentaDestinoId: "c2" }
    })).rejects.toThrow(/mayor a 0/);

    expect(financeServiceMock.transferirEntreCuentas).not.toHaveBeenCalled();
  });

  it("saveTransferencia rechaza si no hay fondos suficientes", async () => {
    await expect(saveTransferencia({
      ...baseCtx,
      cuentas: [{ id: "c1", nombre: "Caja", monto: 10 }, { id: "c2", nombre: "Banco", monto: 0 }],
      financeForm: { ...baseCtx.financeForm, monto: "20", cuentaId: "c1", cuentaDestinoId: "c2" }
    })).rejects.toThrow(/Fondos insuficientes/i);

    expect(financeServiceMock.transferirEntreCuentas).not.toHaveBeenCalled();
  });

  it("saveAhorroMeta rechaza monto cero o negativo", async () => {
    await expect(saveAhorroMeta({
      ...baseCtx,
      financeForm: { ...baseCtx.financeForm, monto: "0", cuentaId: "c1", metaId: "m1" }
    })).rejects.toThrow(/mayor a 0/);

    expect(financeServiceMock.aportarAhorroMeta).not.toHaveBeenCalled();
  });

  it("saveAhorroMeta rechaza si no hay fondos suficientes", async () => {
    await expect(saveAhorroMeta({
      ...baseCtx,
      cuentas: [{ id: "c1", nombre: "Caja", monto: 50 }],
      financeForm: { ...baseCtx.financeForm, cuentaId: "c1", monto: "120", metaId: "m1" }
    })).rejects.toThrow(/Fondos insuficientes/i);

    expect(financeServiceMock.aportarAhorroMeta).not.toHaveBeenCalled();
  });

  it("saveFijo propaga error de validacion del schema", async () => {
    validateDataMock.mockReturnValueOnce({ success: false, errors: { diaCobro: "El día debe estar entre 1 y 31" } });

    await expect(saveFijo({
      ...baseCtx,
      financeForm: { ...baseCtx.financeForm, diaCobro: "45" }
    })).rejects.toThrow(/entre 1 y 31/);

    expect(financeServiceMock.addEntity).not.toHaveBeenCalled();
  });

  it("saveMeta propaga error de validacion del schema", async () => {
    validateDataMock.mockReturnValueOnce({ success: false, errors: { montoObjetivo: "El monto objetivo debe ser positivo" } });

    await expect(saveMeta({
      ...baseCtx,
      financeForm: { ...baseCtx.financeForm, monto: "0" }
    })).rejects.toThrow(/positivo/);

    expect(financeServiceMock.addEntity).not.toHaveBeenCalled();
  });

  it("saveHabito propaga error de validacion del schema", async () => {
    validateDataMock.mockReturnValueOnce({ success: false, errors: { nombre: "El nombre es requerido" } });

    await expect(saveHabito({
      ...baseCtx,
      healthForm: { ...baseCtx.healthForm, nombre: "" }
    })).rejects.toThrow(/requerido/);

    expect(financeServiceMock.addEntity).not.toHaveBeenCalled();
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

  it("saveTransferencia actualiza ambas cuentas y movimiento atomicamente", async () => {
    await saveTransferencia({
      ...baseCtx,
      cuentas: [{ id: "c1", nombre: "Caja", monto: 100 }, { id: "c2", nombre: "Banco", monto: 0 }],
      financeForm: {
        ...baseCtx.financeForm,
        monto: "20",
        cuentaId: "c1",
        cuentaDestinoId: "c2"
      }
    });

    expect(financeServiceMock.transferirEntreCuentas).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        origenId: "c1",
        destinoId: "c2",
        monto: 20,
        movimiento: expect.objectContaining({ tipo: "TRANSFERENCIA", monto: 20 })
      })
    );
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

  it("saveAhorroMeta descuenta cuenta, suma meta y registra movimiento atomicamente", async () => {
    await saveAhorroMeta({
      ...baseCtx,
      cuentas: [{ id: "c1", nombre: "Caja", monto: 500 }],
      financeForm: {
        ...baseCtx.financeForm,
        cuentaId: "c1",
        metaId: "m1",
        monto: "120"
      }
    });

    expect(financeServiceMock.aportarAhorroMeta).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        cuentaId: "c1",
        metaId: "m1",
        monto: 120,
        movimiento: expect.objectContaining({ tipo: "AHORRO_META", metaId: "m1", monto: 120 })
      })
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


