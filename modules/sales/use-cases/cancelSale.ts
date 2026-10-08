import { cancelSalePersistence } from "@/modules/finance/services/financeTransactionService";
import type { Venta } from "@/modules/sales/types";

export function cancelSale(uid: string, venta: Venta, movimientoId?: string) {
  return cancelSalePersistence(uid, venta, movimientoId);
}
