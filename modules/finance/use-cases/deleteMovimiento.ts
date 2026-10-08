import type { Movimiento } from "@/modules/finance/types";
import { deleteMovementWithAdjustments } from "@/modules/finance/services/financeTransactionService";
export async function deleteMovimientoConReverso(uid: string, mov: Movimiento): Promise<void> {
  await deleteMovementWithAdjustments(uid, mov.id);
}
