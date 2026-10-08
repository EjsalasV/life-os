import { cancelSalePersistence } from "@/modules/finance/services/financeTransactionService";
import type { Venta } from "@/app/types";

export function cancelSale(uid: string, venta: Venta, movimientoId?: string) {
  return cancelSalePersistence(uid, venta, movimientoId);
}
