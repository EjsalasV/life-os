import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { safeMonto } from "@/app/utils/helpers";
import type { Movimiento } from "@/app/types";

const userDoc = (uid: string, col: string, id: string) => doc(db, "users", uid, col, id);

/**
 * Borra un movimiento revirtiendo su efecto sobre los saldos.
 * Se usa una transacción porque la cuenta/meta pudo haber sido
 * eliminada después de crear el movimiento: solo se revierte lo que exista.
 */
export async function deleteMovimientoConReverso(uid: string, mov: Movimiento): Promise<void> {
  const monto = safeMonto(mov.monto);
  const movRef = userDoc(uid, "movimientos", mov.id);

  await runTransaction(db, async (tx) => {
    const ajustes: Array<{ ref: ReturnType<typeof userDoc>; campo: string; delta: number }> = [];

    const cuentaId = (mov as any).cuentaId;
    const cuentaDestinoId = (mov as any).cuentaDestinoId;
    const metaId = (mov as any).metaId;

    if (mov.tipo === "GASTO" && cuentaId) {
      ajustes.push({ ref: userDoc(uid, "cuentas", cuentaId), campo: "monto", delta: monto });
    } else if (mov.tipo === "INGRESO" && cuentaId) {
      ajustes.push({ ref: userDoc(uid, "cuentas", cuentaId), campo: "monto", delta: -monto });
    } else if (mov.tipo === "TRANSFERENCIA") {
      if (cuentaId) ajustes.push({ ref: userDoc(uid, "cuentas", cuentaId), campo: "monto", delta: monto });
      if (cuentaDestinoId) ajustes.push({ ref: userDoc(uid, "cuentas", cuentaDestinoId), campo: "monto", delta: -monto });
    } else if (mov.tipo === "AHORRO_META") {
      if (cuentaId) ajustes.push({ ref: userDoc(uid, "cuentas", cuentaId), campo: "monto", delta: monto });
      if (metaId) ajustes.push({ ref: userDoc(uid, "metas", metaId), campo: "montoActual", delta: -monto });
    }

    const snaps = await Promise.all(ajustes.map((a) => tx.get(a.ref)));

    snaps.forEach((snap, i) => {
      if (snap.exists()) {
        tx.update(ajustes[i].ref, { [ajustes[i].campo]: increment(ajustes[i].delta) });
      }
    });

    tx.delete(movRef);
  });
}
