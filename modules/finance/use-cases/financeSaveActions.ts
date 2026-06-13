import { safeMonto } from "@/app/utils/helpers";
import { validateData, schemas } from "@/app/schemas";
import { FREE_PLAN_LIMITS } from "@/app/constants/plan-limits";
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

  if (!productForm.id && !isPro && productosCount >= FREE_PLAN_LIMITS.productos) {
    throw new Error(`Límite de ${FREE_PLAN_LIMITS.productos} productos alcanzado. ¡Mejora a PRO! 🚀`);
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

// Convierte la fecha "YYYY-MM-DD" del formulario a Date al mediodía local
// (evita que la zona horaria corra el movimiento al día anterior/siguiente).
// Sin fecha o con fecha inválida, usa el momento actual.
function timestampDesdeFecha(fecha?: string): Date {
  if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [y, m, d] = fecha.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (!isNaN(date.getTime())) return date;
  }
  return new Date();
}

export async function saveMovimiento(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas, updateStreakExternal } = ctx;

  const validation = validateData(schemas.movimiento, financeForm);
  if (!validation.success) {
    throw new Error(`Validacion de movimiento fallo: ${JSON.stringify(validation.errors)}`);
  }

  const valor = safeMonto(financeForm.monto);
  const esGasto = financeForm.tipo === "GASTO";

  // Payload explícito: solo los campos que definen un movimiento.
  // No se persiste el formulario completo (periodicidad, limite, etc.).
  await financeService.registrarMovimientoConSaldo(uid, {
    cuentaId: financeForm.cuentaId,
    delta: esGasto ? -valor : valor,
    movimiento: {
      nombre: financeForm.nombre,
      monto: valor,
      tipo: financeForm.tipo,
      categoria: financeForm.categoria || "otros",
      cuentaId: financeForm.cuentaId,
      cuentaNombre: cuentas.find((c) => c.id === financeForm.cuentaId)?.nombre || "General",
      timestamp: timestampDesdeFecha((financeForm as { fecha?: string }).fecha)
    }
  });

  if (esGasto) await updateStreakExternal();
}

export async function saveCuenta(ctx: FinanceActionContext): Promise<void> {
  const { uid, isPro, cuentas, financeForm } = ctx;

  if (!isPro && cuentas.length >= FREE_PLAN_LIMITS.cuentas) {
    throw new Error(`Límite de ${FREE_PLAN_LIMITS.cuentas} cuentas alcanzado. 🏦`);
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

function primerError(errors: Record<string, string>): string {
  return String(Object.values(errors)[0] || "Datos inválidos");
}

export async function saveFijo(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const payload = {
    nombre: financeForm.nombre,
    monto: financeForm.monto,
    periodicidad: financeForm.periodicidad || "Mensual",
    diaCobro: financeForm.diaCobro || "1"
  };

  const validation = validateData(schemas.fijo, payload);
  if (!validation.success) throw new Error(primerError(validation.errors));

  await financeService.addEntity(uid, "fijos", {
    ...payload,
    monto: safeMonto(financeForm.monto),
    cuentaId: financeForm.cuentaId,
    timestamp: financeService.timestamp()
  });
}

export async function saveMeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const validation = validateData(schemas.meta, {
    nombre: financeForm.nombre,
    montoObjetivo: financeForm.monto
  });
  if (!validation.success) throw new Error(primerError(validation.errors));

  await financeService.addEntity(uid, "metas", {
    nombre: financeForm.nombre,
    montoObjetivo: safeMonto(financeForm.monto),
    montoActual: 0,
    timestamp: financeService.timestamp()
  });
}

export async function savePresupuesto(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const now = new Date();
  const mes = now.getMonth();
  const año = now.getFullYear();
  const limite = safeMonto(financeForm.limite);
  const categoria = financeForm.categoria || "otros";

  // Si ya tiene ID de Firebase → actualizar
  if (financeForm.id) {
    await financeService.updateEntity(uid, "presupuestos", financeForm.id, {
      categoria,
      limite,
      ultimaActualizacion: financeService.timestamp()
    });
    return;
  }

  // Si no existe → crear nuevo con historial inicial
  const historialInicial: Array<{ mes: number; año: number; limite: number; gastado: number; superado: boolean }> = [
    { mes, año, limite, gastado: 0, superado: false }
  ];

  await financeService.addEntity(uid, "presupuestos", {
    categoria,
    limite,
    historial: historialInicial,
    alertas: [],
    ultimaActualizacion: financeService.timestamp(),
    timestamp: financeService.timestamp()
  });
}

export async function saveHabito(ctx: FinanceActionContext): Promise<void> {
  const { uid, healthForm } = ctx;

  const payload = {
    nombre: healthForm.nombre,
    frecuencia: healthForm.frecuencia || "Diario",
    iconType: healthForm.iconType || "pill"
  };

  const validation = validateData(schemas.habito, payload);
  if (!validation.success) throw new Error(primerError(validation.errors));

  await financeService.addEntity(uid, "habitos", {
    ...payload,
    timestamp: financeService.timestamp()
  });
}

export async function saveTransferencia(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas } = ctx;

  const monto = safeMonto(financeForm.monto);
  if (monto <= 0) {
    throw new Error("El monto a transferir debe ser mayor a 0");
  }
  if (!financeForm.cuentaId || !financeForm.cuentaDestinoId) {
    throw new Error("Selecciona ambas cuentas");
  }
  if (financeForm.cuentaId === financeForm.cuentaDestinoId) {
    throw new Error("No puedes transferir a la misma cuenta");
  }

  await financeService.transferirEntreCuentas(uid, {
    origenId: financeForm.cuentaId,
    destinoId: financeForm.cuentaDestinoId,
    monto,
    movimiento: {
      nombre: `Transferencia: ${cuentas.find((c) => c.id === financeForm.cuentaId)?.nombre} → ${cuentas.find((c) => c.id === financeForm.cuentaDestinoId)?.nombre}`,
      monto,
      tipo: "TRANSFERENCIA",
      cuentaId: financeForm.cuentaId,
      cuentaDestinoId: financeForm.cuentaDestinoId,
      timestamp: new Date()
    }
  });
}

export async function saveAhorroMeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const monto = safeMonto(financeForm.monto);
  if (monto <= 0) {
    throw new Error("El monto a ahorrar debe ser mayor a 0");
  }
  if (!financeForm.cuentaId) {
    throw new Error("Selecciona una cuenta");
  }

  const metaId = (financeForm as any).metaId;
  if (!metaId) {
    throw new Error("No se selecciono una meta");
  }

  await financeService.aportarAhorroMeta(uid, {
    cuentaId: financeForm.cuentaId,
    metaId,
    monto,
    movimiento: {
      nombre: "Ahorro a meta",
      monto,
      tipo: "AHORRO_META",
      cuentaId: financeForm.cuentaId,
      metaId,
      timestamp: new Date()
    }
  });
}

export async function saveTarjeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const limite = safeMonto(financeForm.limite);
  const saldo = safeMonto(financeForm.saldo);

  if (financeForm.id) {
    // Editar tarjeta existente
    await financeService.updateEntity(uid, "tarjetas", financeForm.id, {
      nombre: financeForm.nombre,
      banco: financeForm.banco,
      limite,
      saldo
    });
    return;
  }

  // Crear nueva tarjeta
  await financeService.addEntity(uid, "tarjetas", {
    nombre: financeForm.nombre,
    banco: financeForm.banco,
    limite,
    saldo,
    timestamp: financeService.timestamp()
  });
}
