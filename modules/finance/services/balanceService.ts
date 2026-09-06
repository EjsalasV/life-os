import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { adjustedBalance, balanceCents, moneyCents } from "@/lib/money";

interface Change { col: string; id: string; field: string; delta: number }
export async function saveBalancedMovement(uid: string, movement: Record<string, unknown>, changes: Change[], requireFunds = false) {
  const movementRef = doc(collection(db, "users", uid, "movimientos"));
  const refs = changes.map((c) => doc(db, "users", uid, c.col, c.id));
  await runTransaction(db, async (tx) => {
    const snapshots = await Promise.all(refs.map((r) => tx.get(r)));
    snapshots.forEach((s, i) => {
      if (!s.exists()) throw new Error("Una cuenta o meta ya no existe");
      const change = changes[i];
      if (requireFunds && change.delta < 0 && balanceCents(s.data()[change.field]) < -moneyCents(change.delta)) {
        throw new Error("Fondos insuficientes en la cuenta de origen");
      }
      tx.update(refs[i], { [change.field]: adjustedBalance(s.data()[change.field], change.delta) });
    });
    tx.set(movementRef, movement);
  });
}
