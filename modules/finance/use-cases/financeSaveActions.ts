import { moneyCents } from "@/lib/money";
import { safeMonto } from "@/app/utils/helpers";
import { validateData } from "@/lib/validation";
import { movimientoSchema, cuentaSchema, fijoSchema, metaSchema, presupuestoSchema } from "@/modules/finance/schemas/financeSchemas";
import { FREE_PLAN_LIMITS } from "@/app/constants/plan-limits";
import { financeService } from "@/modules/finance/services/financeService";
import { editMovementWithBalance } from "@/modules/finance/services/financeTransactionService";
import type { Cuenta } from "@/modules/finance/types";
import type { FinanceActionContext } from "./financeActionTypes";

// Convierte la fecha "YYYY-MM-DD" del formulario a Date al mediodía local
// (evita que la zona horaria corra el movimiento al día anterior/siguiente).
// Sin fecha o con fecha inválida, usa el momento actual.
function timestampDesdeFecha(fecha?: string): Date {
  if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [y, m, d] = fecha.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
    throw new Error("La fecha no es válida");
  }
  return new Date();
}

function getCuentaDisponible(cuentas: Cuenta[], cuentaId: string): number {
  const cuenta = cuentas.find((item) => item.id === cuentaId);
  if (!cuenta) {
    throw new Error("La cuenta seleccionada ya no existe");
  }

  return safeMonto(cuenta.monto);
}

export async function saveMovimiento(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas, updateStreakExternal } = ctx;

  const validation = validateData(movimientoSchema, financeForm);
  if (!validation.success) {
    throw new Error(primerError(validation.errors));
  }

  const valor = safeMonto(financeForm.monto);
  const esGasto = financeForm.tipo === "GASTO";
  const cuentaNombre = cuentas.find((c) => c.id === financeForm.cuentaId)?.nombre || "General";
  const timestamp = timestampDesdeFecha((financeForm as { fecha?: string }).fecha);

  if (financeForm.id) {
    await editMovementWithBalance({
      uid,
      movementId: financeForm.id,
      nombre: financeForm.nombre,
      monto: valor,
      tipo: financeForm.tipo as "INGRESO" | "GASTO",
      cuentaId: financeForm.cuentaId,
      cuentaNombre,
      categoria: financeForm.categoria || "otros",
      timestamp
    });
    return;
  }

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
      cuentaNombre,
      timestamp
    }
  });

  if (esGasto) await updateStreakExternal().catch(() => {}); // Saving succeeded; never invite a duplicate retry for a streak failure.
}

export async function saveCuenta(ctx: FinanceActionContext): Promise<void> {
  const { uid, isPro, cuentas, financeForm } = ctx;

  if (!financeForm.id && !isPro && cuentas.length >= FREE_PLAN_LIMITS.cuentas) {
    throw new Error(`Límite de ${FREE_PLAN_LIMITS.cuentas} cuentas alcanzado. 🏦`);
  }

  const validation = validateData(cuentaSchema, financeForm);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(String(firstError));
  }

  if (financeForm.id) {
    await financeService.updateEntity(uid, "cuentas", financeForm.id, {
      nombre: financeForm.nombre
    });
    return;
  }

  await financeService.addEntity(uid, "cuentas", {
    nombre: financeForm.nombre,
    monto: safeMonto(financeForm.monto),
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
    diaCobro: financeForm.diaCobro || "1",
    cuentaId: financeForm.cuentaId || undefined
  };

  const validation = validateData(fijoSchema, payload);
  if (!validation.success) throw new Error(primerError(validation.errors));

  if (financeForm.id) {
    await financeService.updateEntity(uid, "fijos", financeForm.id, {
      ...payload,
      ...(financeForm.cuentaId ? {} : { cuentaId: null }),
      monto: safeMonto(financeForm.monto)
    });
    return;
  }

  await financeService.addEntity(uid, "fijos", {
    ...payload,
    ...(financeForm.cuentaId ? {} : { cuentaId: null }),
    monto: safeMonto(financeForm.monto),
    timestamp: financeService.timestamp()
  });
}

export async function saveMeta(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm } = ctx;

  const validation = validateData(metaSchema, {
    nombre: financeForm.nombre,
    montoObjetivo: financeForm.monto
  });
  if (!validation.success) throw new Error(primerError(validation.errors));

  if (financeForm.id) {
    await financeService.updateEntity(uid, "metas", financeForm.id, {
      nombre: financeForm.nombre,
      montoObjetivo: safeMonto(financeForm.monto)
    });
    return;
  }

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
  const validation = validateData(presupuestoSchema, { categoria, limite: String(financeForm.limite) });
  if (!validation.success) throw new Error(primerError(validation.errors));

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

export async function saveTransferencia(ctx: FinanceActionContext): Promise<void> {
  const { uid, financeForm, cuentas } = ctx;

  const monto = moneyCents(financeForm.monto) / 100;
  if (monto <= 0) {
    throw new Error("El monto a transferir debe ser mayor a 0");
  }
  if (!financeForm.cuentaId || !financeForm.cuentaDestinoId) {
    throw new Error("Selecciona ambas cuentas");
  }
  if (financeForm.cuentaId === financeForm.cuentaDestinoId) {
    throw new Error("No puedes transferir a la misma cuenta");
  }
  if (getCuentaDisponible(cuentas, financeForm.cuentaId) < monto) {
    throw new Error("Fondos insuficientes en la cuenta de origen");
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
  const { uid, financeForm, cuentas } = ctx;

  const monto = moneyCents(financeForm.monto) / 100;
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
  if (getCuentaDisponible(cuentas, financeForm.cuentaId) < monto) {
    throw new Error("Fondos insuficientes en la cuenta seleccionada");
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

  const limite = moneyCents(financeForm.limite) / 100;
  const saldo = moneyCents(financeForm.saldo || "0") / 100;
  if (!financeForm.nombre.trim() || financeForm.nombre.length > 100 || limite < 0 || saldo < 0) throw new Error("Revisa el nombre, límite y saldo de la tarjeta");

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
