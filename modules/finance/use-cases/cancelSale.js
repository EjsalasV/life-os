import { doc, getDoc, writeBatch, increment } from "firebase/firestore";
import { db } from "@/services/firebase/client";

const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

export async function cancelSale(uid, venta, movimientoId) {
  const batch = writeBatch(db);

  // La cuenta también pudo ser eliminada después de la venta.
  if (venta.cuentaId) {
    const cuentaSnap = await getDoc(userDoc(uid, "cuentas", venta.cuentaId));
    if (cuentaSnap.exists()) {
      batch.update(userDoc(uid, "cuentas", venta.cuentaId), {
        monto: increment(-venta.total)
      });
    }
  }

  // Restaurar stock solo de productos que aún existen: un update sobre un
  // producto borrado haría fallar el batch completo y la venta quedaría
  // imposible de anular.
  if (venta.items?.length) {
    const snaps = await Promise.all(
      venta.items.map((p) => getDoc(userDoc(uid, "productos", p.id)))
    );
    venta.items.forEach((p, i) => {
      if (snaps[i].exists()) {
        batch.update(userDoc(uid, "productos", p.id), {
          stock: increment(p.cantidad)
        });
      }
    });
  }

  if (movimientoId) {
    batch.delete(userDoc(uid, "movimientos", movimientoId));
  }

  batch.delete(userDoc(uid, "ventas", venta.id));
  await batch.commit();
}
