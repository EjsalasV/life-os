import { doc, getDoc, increment, runTransaction, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { safeMonto } from "@/app/utils/helpers";

const userDoc = (uid: string, collectionName: string, id: string) => doc(db, "users", uid, collectionName, id);

export interface BalanceAdjustment {
  collectionName: string;
  id: string;
  field: string;
  delta: number;
}

function signedDeltaForMovement(movement: { tipo?: string; monto?: number | string }) {
  const monto = safeMonto(movement.monto);
  if (movement.tipo === "INGRESO") return monto;
  if (movement.tipo === "GASTO") return -monto;
  return 0;
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

interface EditMovementPersistenceInput {
  uid: string;
  movementId: string;
  nombre: string;
  monto: number;
  tipo: "INGRESO" | "GASTO";
  cuentaId: string;
  cuentaNombre: string;
  categoria: string;
  timestamp: Date;
}

export async function editMovementWithBalance(input: EditMovementPersistenceInput): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const movementRef = userDoc(input.uid, "movimientos", input.movementId);
    const movementSnapshot = await transaction.get(movementRef);

    if (!movementSnapshot.exists()) {
      throw new Error("El movimiento ya no existe");
    }

    const previousMovement = movementSnapshot.data() as {
      tipo?: string;
      monto?: number | string;
      cuentaId?: string;
      ventaRefId?: string;
    };

    if (previousMovement.ventaRefId) {
      throw new Error("Los movimientos de ventas no se editan desde esta vista");
    }

    if (previousMovement.tipo !== "INGRESO" && previousMovement.tipo !== "GASTO") {
      throw new Error("Solo puedes editar ingresos o gastos manuales");
    }

    const oldAccountId = previousMovement.cuentaId;
    const newAccountId = input.cuentaId;
    const touchedAccounts = new Map<string, number>();

    const oldSignedDelta = signedDeltaForMovement(previousMovement);
    const newSignedDelta = signedDeltaForMovement(input);

    if (oldAccountId) {
      touchedAccounts.set(oldAccountId, (touchedAccounts.get(oldAccountId) || 0) - oldSignedDelta);
    }
    touchedAccounts.set(newAccountId, (touchedAccounts.get(newAccountId) || 0) + newSignedDelta);

    for (const [accountId, delta] of touchedAccounts.entries()) {
      if (!delta) continue;
      transaction.update(userDoc(input.uid, "cuentas", accountId), { monto: increment(delta) });
    }

    transaction.update(movementRef, {
      nombre: input.nombre,
      monto: input.monto,
      tipo: input.tipo,
      cuentaId: input.cuentaId,
      cuentaNombre: input.cuentaNombre,
      categoria: input.categoria,
      timestamp: input.timestamp
    });
  });
}
