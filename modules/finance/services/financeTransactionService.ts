import { collection, doc, getDocs, query, runTransaction, where } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { adjustedBalance, moneyCents } from "@/lib/money";
import type { Movimiento } from "@/app/types";
const userDoc = (uid: string, col: string, id: string) => doc(db, "users", uid, col, id);

export async function deleteMovementWithAdjustments(uid: string, movementId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = userDoc(uid, "movimientos", movementId);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) return;
    const mov = snapshot.data() as Movimiento;
    if (mov.ventaRefId) throw new Error("Anula el ticket desde Negocio para revertir también el inventario.");
    const amount = moneyCents(mov.monto) / 100;
    const changes: Array<{ col: string; id: string; field: string; delta: number }> = [];
    if (mov.cuentaId) changes.push({ col: "cuentas", id: mov.cuentaId, field: "monto", delta: mov.tipo === "INGRESO" ? -amount : amount });
    if (mov.tipo === "TRANSFERENCIA" && mov.cuentaDestinoId) changes.push({ col: "cuentas", id: mov.cuentaDestinoId, field: "monto", delta: -amount });
    if (mov.tipo === "AHORRO_META" && mov.metaId) changes.push({ col: "metas", id: mov.metaId, field: "montoActual", delta: -amount });
    if (!["INGRESO", "GASTO", "TRANSFERENCIA", "AHORRO_META"].includes(mov.tipo)) throw new Error("Tipo de movimiento no reconocido");
    const targets = changes.map((c) => userDoc(uid, c.col, c.id));
    const snapshots = await Promise.all(targets.map((r) => tx.get(r)));
    snapshots.forEach((s, i) => {
      if (s.exists()) tx.update(targets[i], { [changes[i].field]: adjustedBalance(s.data()[changes[i].field], changes[i].delta) });
    });
    tx.delete(ref);
  });
}

export async function cancelSalePersistence(uid: string, sale: { id: string }, _movementId?: string): Promise<void> {
  // Relation is immutable; resolve independently of the visible month.
  const movements = await getDocs(query(collection(db, "users", uid, "movimientos"), where("ventaRefId", "==", sale.id)));
  await runTransaction(db, async (tx) => {
    const saleRef = userDoc(uid, "ventas", sale.id);
    const saleSnapshot = await tx.get(saleRef);
    if (!saleSnapshot.exists()) return;
    const current = saleSnapshot.data();
    const accountRef = userDoc(uid, "cuentas", current.cuentaId);
    const quantities = new Map<string, number>();
    for (const item of current.items || []) {
      if (!Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) throw new Error("La venta tiene cantidades inválidas");
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.cantidad);
    }
    const productRefs = [...quantities.keys()].map((id) => userDoc(uid, "productos", id));
    const [account, ...products] = await Promise.all([tx.get(accountRef), ...productRefs.map((r) => tx.get(r))]);
    if (account.exists()) tx.update(accountRef, { monto: adjustedBalance(account.data().monto, -moneyCents(current.total) / 100) });
    products.forEach((p, i) => {
      if (p.exists()) {
        const stock = p.data().stock + quantities.get(p.id)!;
        if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("El stock guardado no es válido");
        tx.update(productRefs[i], { stock });
      }
    });
    movements.docs.forEach((m) => tx.delete(m.ref));
    tx.delete(saleRef);
  });
}

interface EditMovementPersistenceInput {
  uid: string; movementId: string; nombre: string; monto: number;
  tipo: "INGRESO" | "GASTO"; cuentaId: string; cuentaNombre: string;
  categoria: string; timestamp: Date;
}
export async function editMovementWithBalance(input: EditMovementPersistenceInput): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = userDoc(input.uid, "movimientos", input.movementId);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw new Error("El movimiento ya no existe");
    const previous = snapshot.data();
    if (previous.ventaRefId) throw new Error("Edita el ticket desde Negocio");
    if (!["INGRESO", "GASTO"].includes(previous.tipo)) throw new Error("Solo puedes editar ingresos o gastos manuales");
    const changes = new Map<string, number>();
    const oldDelta = moneyCents(previous.monto) * (previous.tipo === "INGRESO" ? 1 : -1);
    const newDelta = moneyCents(input.monto) * (input.tipo === "INGRESO" ? 1 : -1);
    if (previous.cuentaId) changes.set(previous.cuentaId, -oldDelta);
    changes.set(input.cuentaId, (changes.get(input.cuentaId) || 0) + newDelta);
    const refs = [...changes.keys()].map((id) => userDoc(input.uid, "cuentas", id));
    const accounts = await Promise.all(refs.map((r) => tx.get(r)));
    accounts.forEach((s, i) => {
      if (!s.exists()) throw new Error("Una cuenta del movimiento ya no existe");
      tx.update(refs[i], { monto: adjustedBalance(s.data().monto, changes.get(s.id)! / 100) });
    });
    const { uid: _uid, movementId: _id, ...fields } = input;
    tx.update(ref, fields);
  });
}
