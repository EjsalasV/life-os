import { cancelSalePersistence } from "@/modules/finance/services/financeTransactionService";

export function cancelSale(uid, venta, movimientoId) {
  return cancelSalePersistence(uid, venta, movimientoId);
}
