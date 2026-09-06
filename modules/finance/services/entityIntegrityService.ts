import { collection, doc, getDocs, limit, query, runTransaction, where } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { balanceCents } from "@/lib/money";

export async function deleteEmptyAccount(uid: string, id: string) {
  const ref = doc(db, "users", uid, "cuentas", id);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) return;
    if (balanceCents(snapshot.data().monto) !== 0) throw new Error("No puedes eliminar una cuenta con saldo distinto de cero");
    const queries = [["movimientos", "cuentaId"], ["movimientos", "cuentaDestinoId"], ["ventas", "cuentaId"], ["fijos", "cuentaId"]];
    const references = await Promise.all(queries.map(([col, field]) => getDocs(query(collection(db, "users", uid, col), where(field, "==", id), limit(1)))));
    if (references.some((s) => !s.empty)) throw new Error("No puedes eliminar una cuenta con movimientos, ventas o gastos fijos asociados");
    tx.delete(ref);
  });
}

export async function updateProduct(uid: string, id: string, data: Record<string, unknown>, expectedStock: number) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "users", uid, "productos", id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw new Error("El producto ya no existe");
    if (snapshot.data().stock !== expectedStock) throw new Error("El stock cambió mientras editabas. Abre otra vez el producto para revisar las existencias actuales.");
    tx.update(ref, data);
  });
}

export async function deleteEmptyGoal(uid: string, id: string) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "users", uid, "metas", id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) return;
    if (balanceCents(snapshot.data().montoActual || 0) !== 0) throw new Error("La meta tiene ahorros. Revierte sus aportes desde Movimientos antes de eliminarla.");
    tx.delete(ref);
  });
}
