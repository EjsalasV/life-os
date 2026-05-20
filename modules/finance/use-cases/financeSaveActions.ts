import { safeMonto } from "@/app/utils/helpers";
import { validateData, schemas } from "@/app/schemas";
import { financeService } from "@/modules/finance/services/financeService";
import type { Cuenta, FinanceForm, ProductForm, HealthForm } from "@/app/types";

interface FinanceActionContext {
  uid: string;
  isPro: boolean;
  cuentas: Cuenta[];
  productosCount: number;
  financeForm: FinanceForm;
  productForm: ProductForm;
  healthForm: HealthForm;
  updateStreakExternal: () => Promise<boolean>;
}

export async function saveProducto(ctx: FinanceActionContext): Promise<void> {
  const { uid, isPro, productosCount, productForm } = ctx;

  if (!productForm.id && !isPro && productosCount >= 5) {
    throw new Error("Límite de 5 productos alcanzado. ¡Mejora a PRO! 🚀");
  }

  const validation = validateData(schemas.producto, productForm);
  if (!validation.success) {
    throw new Error(`Validacion de producto fallo: ${JSON.stringify(validation.errors)}`);
  }

  const stockFinal = Math.max(0, parseInt(productForm.stock) || 0);

  if (productForm.id) {
    if (!isPro) throw new Error("La edición es función PRO 💎");

    await financeService.updateEntity(uid, "productos", productForm.id, {
      nombre: productForm.nombre,
      precioVenta: safeMonto(productForm.precioVenta),
      costo: safeMonto(productForm.costo),
      stock: stockFinal
    });
    return;
  }

  await financeService.addEntity(uid, "productos", {
    nombre: productForm.nombre,
    precioVenta: safeMonto(productForm.precioVenta),
    costo: safeMonto(productForm.costo),
    stock: stockFinal,
    timestamp: financeService.timestamp()
  });
}

export async function saveMovimiento(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas, updateStreakExternal } = ctx;

  const validation = validateData(schemas.movimiento, financeForm);
  if (!validation.success) {
    throw new Error(`Validacion de movimiento fallo: ${JSON.stringify(validation.errors)}`);
  }

  const valor = safeMonto(financeForm.monto);
  const esGasto = financeForm.tipo === "GASTO";

  await financeService.updateCuentaMonto(uid, financeForm.cuentaId, esGasto ? -valor : valor);

  await financeService.addMovimiento(uid, {
    ...financeForm,
    monto: valor,
    timestamp: new Date(),
    cuentaNombre: cuentas.find((c) => c.id === financeForm.cuentaId)?.nombre || "General"
  });

  if (esGasto) await updateStreakExternal();
}

export async function saveCuenta(ctx: FinanceActionContext): Promise<void> {
  const { uid, isPro, cuentas, financeForm } = ctx;

  if (!isPro && cuentas.length >= 2) {
    throw new Error("Límite de 2 cuentas alcanzado. 🏦");
  }

  const validation = validateData(schemas.cuenta, financeForm);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(String(firstError));
  }

  await financeService.addEntity(uid, "cuentas", {
    nombre: financeForm.nombre,
    monto: safeMonto(financeForm.monto),
    timestamp: financeService.timestamp()
  });
}

export async function savePeso(ctx: FinanceActionContext): Promise<void> {
  const { uid, isPro, healthForm } = ctx;

  if (!isPro) throw new Error("Seguimiento de peso es función PRO 💎");

  const validation = validateData(schemas.peso, healthForm);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(String(firstError));
  }

  await financeService.addEntity(uid, "peso", {
    peso: safeMonto(healthForm.peso),
    timestamp: financeService.timestamp()
  });
}

export async function saveFijo(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  await financeService.addEntity(uid, "fijos", {
    nombre: financeForm.nombre,
    monto: safeMonto(financeForm.monto),
    periodicidad: financeForm.periodicidad || "Mensual",
    diaCobro: financeForm.diaCobro || "1",
    cuentaId: financeForm.cuentaId,
    timestamp: financeService.timestamp()
  });
}

export async function saveMeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  await financeService.addEntity(uid, "metas", {
    nombre: financeForm.nombre,
    montoObjetivo: safeMonto(financeForm.monto),
    montoActual: 0,
    timestamp: financeService.timestamp()
  });
}

export async function savePresupuesto(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  await financeService.addEntity(uid, "presupuestos", {
    categoria: financeForm.categoria || "otros",
    limite: safeMonto(financeForm.limite),
    timestamp: financeService.timestamp()
  });
}

export async function saveHabito(ctx: FinanceActionContext): Promise<void> {
  const { uid, healthForm } = ctx;

  await financeService.addEntity(uid, "habitos", {
    nombre: healthForm.nombre,
    frecuencia: healthForm.frecuencia || "Diario",
    iconType: healthForm.iconType || "pill",
    timestamp: financeService.timestamp()
  });
}

export async function saveTransferencia(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas } = ctx;

  const monto = safeMonto(financeForm.monto);
  if (!financeForm.cuentaId || !financeForm.cuentaDestinoId) {
    throw new Error("Selecciona ambas cuentas");
  }
  if (financeForm.cuentaId === financeForm.cuentaDestinoId) {
    throw new Error("No puedes transferir a la misma cuenta");
  }

  await financeService.updateCuentaMonto(uid, financeForm.cuentaId, -monto);
  await financeService.updateCuentaMonto(uid, financeForm.cuentaDestinoId, monto);

  await financeService.addMovimiento(uid, {
    nombre: `Transferencia: ${cuentas.find((c) => c.id === financeForm.cuentaId)?.nombre} → ${cuentas.find((c) => c.id === financeForm.cuentaDestinoId)?.nombre}`,
    monto,
    tipo: "TRANSFERENCIA",
    cuentaId: financeForm.cuentaId,
    cuentaDestinoId: financeForm.cuentaDestinoId,
    timestamp: new Date()
  });
}

export async function saveAhorroMeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const monto = safeMonto(financeForm.monto);
  if (!financeForm.cuentaId) {
    throw new Error("Selecciona una cuenta");
  }

  const metaId = (financeForm as any).metaId;
  if (!metaId) {
    throw new Error("No se selecciono una meta");
  }

  await financeService.updateCuentaMonto(uid, financeForm.cuentaId, -monto);
  await financeService.updateMetaMontoActual(uid, metaId, monto);

  await financeService.addMovimiento(uid, {
    nombre: "Ahorro a meta",
    monto,
    tipo: "AHORRO_META",
    cuentaId: financeForm.cuentaId,
    metaId,
    timestamp: new Date()
  });
}
