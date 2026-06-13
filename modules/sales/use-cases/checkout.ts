import { db } from "@/services/firebase/client";
import { doc, collection, writeBatch, serverTimestamp, increment } from "firebase/firestore";
import { toCents, fromCents } from "@/app/utils/helpers";
import { validateData, schemas } from "@/app/schemas";
import { FREE_PLAN_LIMITS } from "@/app/constants/plan-limits";
import type { Venta, Movimiento, Cuenta, PosForm, ItemCarrito, Producto } from "@/app/types";

interface CheckoutValidationContext {
  isPro: boolean;
  posForm: PosForm;
  ventas: Venta[];
  carrito: ItemCarrito[];
  productos?: Producto[];
}

export function validateCheckout({ isPro, posForm, ventas, carrito, productos }: CheckoutValidationContext): string | null {
  if (!isPro && !posForm.id) {
    const ahora = new Date();
    const ventasEsteMes = ventas.filter((v) => {
      const fechaVenta = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
      return fechaVenta.getMonth() === ahora.getMonth() && fechaVenta.getFullYear() === ahora.getFullYear();
    });

    if (ventasEsteMes.length >= FREE_PLAN_LIMITS.ventasPorMes) {
      return `Límite mensual alcanzado (${FREE_PLAN_LIMITS.ventasPorMes} ventas). ¡Pásate a PRO! 🚀`;
    }
  }

  if (!posForm?.cuentaId || posForm.cuentaId === "") {
    return "Debes seleccionar una cuenta de destino";
  }

  if (!posForm.id && (!carrito || carrito.length === 0)) {
    return "El carrito está vacío";
  }

  // Validar stock actual: el carrito pudo armarse antes de que otro
  // dispositivo/venta redujera las existencias.
  if (!posForm.id && productos) {
    for (const item of carrito) {
      const producto = productos.find((p) => p.id === item.id);
      if (!producto) {
        return `El producto "${item.nombre || item.id}" ya no existe`;
      }
      if ((producto.stock || 0) < item.cantidad) {
        return `Stock insuficiente de "${producto.nombre}" (quedan ${producto.stock || 0})`;
      }
    }
  }

  return null;
}

// Valida la venta contra el schema. Devuelve el primer error o null si es válida.
// El cliente vacío es legal: cae al default "Consumidor Final" antes de validar.
export function validateVentaSchema(posForm: PosForm, carrito: ItemCarrito[]): string | null {
  const validation = validateData(schemas.venta, {
    cliente: posForm.cliente || "Consumidor Final",
    cuentaId: posForm.cuentaId,
    items: carrito
  });

  if (!validation.success) {
    return String(Object.values(validation.errors)[0] || "Venta inválida");
  }
  return null;
}

interface CheckoutEditContext {
  uid: string;
  isPro: boolean;
  posForm: PosForm;
  ventas: Venta[];
  movimientos: Movimiento[];
  cuentas: Cuenta[];
}

export async function checkoutEdit(context: CheckoutEditContext): Promise<void> {
  const { uid, isPro, posForm, ventas, movimientos, cuentas } = context;

  if (!isPro) {
    throw new Error("La edición de tickets es función PRO 💎");
  }

  const batch = writeBatch(db);
  const docRef = (col: string, id: string) => doc(db, "users", uid, col, id);

  const ventaOriginal = ventas.find((v) => v.id === posForm.id);
  const movOriginal = movimientos?.find((m) => (m as any).ventaRefId === posForm.id);

  if (ventaOriginal && ventaOriginal.cuentaId !== posForm.cuentaId) {
    batch.update(docRef("cuentas", ventaOriginal.cuentaId), { monto: increment(-ventaOriginal.total) });
    batch.update(docRef("cuentas", posForm.cuentaId), { monto: increment(ventaOriginal.total) });
  }

  batch.update(docRef("ventas", posForm.id!), {
    cliente: posForm.cliente || "Consumidor Final",
    cuentaId: posForm.cuentaId
  });

  if (movOriginal && ventaOriginal) {
    batch.update(docRef("movimientos", movOriginal.id), {
      nombre: `Venta Ticket #${(ventaOriginal as any).reciboId} (Editado)`,
      cuentaId: posForm.cuentaId,
      cuentaNombre: cuentas.find((c) => c.id === posForm.cuentaId)?.nombre || "Caja"
    });
  }

  await batch.commit();
}

interface CheckoutCreateContext {
  uid: string;
  carrito: ItemCarrito[];
  ventas: Venta[];
  posForm: PosForm;
  cuentas: Cuenta[];
}

export async function checkoutCreate(context: CheckoutCreateContext): Promise<{ reciboId: string; totalFinal: number }> {
  const { uid, carrito, ventas, posForm, cuentas } = context;

  const batch = writeBatch(db);
  const docRef = (col: string, id: string) => doc(db, "users", uid, col, id);

  let totalCents = 0;
  let costoCents = 0;

  for (const item of carrito) {
    totalCents += toCents(item.precioUnitario) * item.cantidad;
    costoCents += toCents((item as any).costo || 0) * item.cantidad;
  }

  const totalFinal = fromCents(totalCents);
  const costoFinal = fromCents(costoCents);
  const gananciaFinal = totalFinal - costoFinal;
  // Máximo existente + 1: usar ventas.length genera números repetidos
  // después de anular una venta.
  const maxRecibo = ventas.reduce((max, v) => {
    const n = parseInt((v as any).reciboId, 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  const reciboId = String(maxRecibo + 1).padStart(4, "0");

  const nuevaVentaRef = doc(collection(db, "users", uid, "ventas"));
  const ventaId = nuevaVentaRef.id;

  batch.set(nuevaVentaRef, {
    reciboId,
    cliente: posForm.cliente || "Consumidor Final",
    items: carrito,
    total: totalFinal,
    costoTotal: costoFinal,
    ganancia: gananciaFinal,
    cuentaId: posForm.cuentaId,
    timestamp: serverTimestamp()
  });

  for (const item of carrito) {
    batch.update(docRef("productos", item.id), { stock: increment(-item.cantidad) });
  }

  batch.update(docRef("cuentas", posForm.cuentaId), { monto: increment(totalFinal) });

  const movRef = doc(collection(db, "users", uid, "movimientos"));
  batch.set(movRef, {
    nombre: `Venta Ticket #${reciboId}`,
    monto: totalFinal,
    tipo: "INGRESO",
    categoria: "comida",
    cuentaId: posForm.cuentaId,
    cuentaNombre: cuentas.find((c) => c.id === posForm.cuentaId)?.nombre || "Caja",
    ventaRefId: ventaId,
    timestamp: serverTimestamp()
  });

  await batch.commit();

  return { reciboId, totalFinal };
}
