import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { balanceCents } from "@/lib/money";

export async function syncBudgetHistory(uid: string, budgetId: string, now = new Date()) {
  const ref = doc(db, "users", uid, "presupuestos", budgetId);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) return;
    const budget = snapshot.data();
    const history = budget.historial || [];
    const month = now.getMonth(); const year = now.getFullYear();
    if (history.some((h: { mes: number; año: number }) => h.mes === month && h.año === year)) return;
    const last = history[0];
    let spending = last?.gastado || 0;
    if (last) {
      const movements = await getDocs(query(collection(db, "users", uid, "movimientos"),
        where("timestamp", ">=", new Date(last.año, last.mes, 1)), where("timestamp", "<", new Date(last.año, last.mes + 1, 1))));
      // Read the fetched documents in the transaction as well: concurrent edits force a retry.
      const verified = await Promise.all(movements.docs.map((m) => tx.get(m.ref)));
      spending = verified.reduce((sum, m) => {
        const data = m.data();
        return data?.tipo === "GASTO" && data.categoria === budget.categoria ? sum + balanceCents(data.monto) : sum;
      }, 0) / 100;
    }
    const previous = history.map((h: Record<string, unknown>, i: number) => i === 0 ? { ...h, gastado: spending, superado: spending > Number(h.limite) } : h);
    tx.update(ref, { historial: [{ mes: month, año: year, limite: budget.limite, gastado: 0, superado: false }, ...previous], ultimaActualizacion: serverTimestamp() });
  });
}
