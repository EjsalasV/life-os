import { doc, writeBatch, increment } from "firebase/firestore";
import { db } from "@/services/firebase/client";

const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

export async function cancelSale(uid, venta, movimientoId) {
  const batch = writeBatch(db);

  if (venta.cuentaId) {
    batch.update(userDoc(uid, "cuentas", venta.cuentaId), {
      monto: increment(-venta.total)
    });
  }

  if (venta.items) {
    for (const p of venta.items) {
      batch.update(userDoc(uid, "productos", p.id), {
        stock: increment(p.cantidad)
      });
    }
  }

  if (movimientoId) {
    batch.delete(userDoc(uid, "movimientos", movimientoId));
  }

  batch.delete(userDoc(uid, "ventas", venta.id));
  await batch.commit();
}
