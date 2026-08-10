import { doc, getDoc, increment, runTransaction, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase/client";

const userDoc = (uid: string, collectionName: string, id: string) => doc(db, "users", uid, collectionName, id);

export interface BalanceAdjustment {
  collectionName: string;
  id: string;
  field: string;
  delta: number;
}

export async function deleteMovementWithAdjustments(
  uid: string,
  movementId: string,
  adjustments: BalanceAdjustment[]
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const references = adjustments.map((item) => userDoc(uid, item.collectionName, item.id));
    const snapshots = await Promise.all(references.map((reference) => transaction.get(reference)));
    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists()) {
        const adjustment = adjustments[index];
        transaction.update(references[index], { [adjustment.field]: increment(adjustment.delta) });
      }
    });
    transaction.delete(userDoc(uid, "movimientos", movementId));
  });
}

export async function cancelSalePersistence(uid: string, sale: any, movementId?: string): Promise<void> {
  const batch = writeBatch(db);
  if (sale.cuentaId) {
    const accountRef = userDoc(uid, "cuentas", sale.cuentaId);
    const account = await getDoc(accountRef);
    if (account.exists()) batch.update(accountRef, { monto: increment(-sale.total) });
  }
  if (sale.items?.length) {
    const productRefs = sale.items.map((item: any) => userDoc(uid, "productos", item.id));
    const products = await Promise.all(productRefs.map((reference: any) => getDoc(reference)));
    products.forEach((snapshot, index) => {
      if (snapshot.exists()) batch.update(productRefs[index], { stock: increment(sale.items[index].cantidad) });
    });
  }
  if (movementId) batch.delete(userDoc(uid, "movimientos", movementId));
  batch.delete(userDoc(uid, "ventas", sale.id));
  await batch.commit();
}
