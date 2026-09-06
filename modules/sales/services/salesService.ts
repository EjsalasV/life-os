import { collection, doc, getDocs, query, runTransaction, where } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { adjustedBalance, moneyCents } from "@/lib/money";
interface EditSalePersistenceInput {
  uid: string; saleId: string; cliente: string; newAccountId: string;
  oldAccountId?: string; total: number; movementId?: string; receiptId?: string; accountName: string;
}
export async function persistSaleEdit(input: EditSalePersistenceInput): Promise<void> {
  const reference = (col: string, id: string) => doc(db, "users", input.uid, col, id);
  const movements = await getDocs(query(collection(db, "users", input.uid, "movimientos"), where("ventaRefId", "==", input.saleId)));
  await runTransaction(db, async (tx) => {
    const saleRef = reference("ventas", input.saleId);
    const saleSnapshot = await tx.get(saleRef);
    if (!saleSnapshot.exists()) throw new Error("La venta ya no existe");
    const sale = saleSnapshot.data();
    const ids = [...new Set([sale.cuentaId, input.newAccountId])];
    const accounts = await Promise.all(ids.map((id) => tx.get(reference("cuentas", id))));
    if (accounts.some((s) => !s.exists())) throw new Error("Una cuenta del ticket ya no existe");
    if (sale.cuentaId !== input.newAccountId) {
      accounts.forEach((s) => tx.update(s.ref, {
        monto: adjustedBalance(s.data()!.monto, moneyCents(sale.total) / 100 * (s.id === input.newAccountId ? 1 : -1))
      }));
    }
    tx.update(saleRef, { cliente: input.cliente, cuentaId: input.newAccountId });
    const name = accounts.find((s) => s.id === input.newAccountId)!.data()!.nombre;
    movements.docs.forEach((m) => tx.update(m.ref, {
      nombre: "Venta Ticket #" + (sale.reciboId || "") + " (Editado)",
      cuentaId: input.newAccountId, cuentaNombre: name
    }));
  });
}
