import { doc, increment, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase/client";

interface EditSalePersistenceInput {
  uid: string;
  saleId: string;
  cliente: string;
  newAccountId: string;
  oldAccountId?: string;
  total: number;
  movementId?: string;
  receiptId?: string;
  accountName: string;
}

export async function persistSaleEdit(input: EditSalePersistenceInput): Promise<void> {
  const batch = writeBatch(db);
  const reference = (collectionName: string, id: string) => doc(db, "users", input.uid, collectionName, id);
  if (input.oldAccountId && input.oldAccountId !== input.newAccountId) {
    batch.update(reference("cuentas", input.oldAccountId), { monto: increment(-input.total) });
    batch.update(reference("cuentas", input.newAccountId), { monto: increment(input.total) });
  }
  batch.update(reference("ventas", input.saleId), { cliente: input.cliente, cuentaId: input.newAccountId });
  if (input.movementId) {
    batch.update(reference("movimientos", input.movementId), {
      nombre: `Venta Ticket #${input.receiptId || ""} (Editado)`,
      cuentaId: input.newAccountId,
      cuentaNombre: input.accountName
    });
  }
  await batch.commit();
}
