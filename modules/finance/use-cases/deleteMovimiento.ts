import { safeMonto } from "@/app/utils/helpers";
import type { Movimiento } from "@/app/types";
import { deleteMovementWithAdjustments, type BalanceAdjustment } from "@/modules/finance/services/financeTransactionService";

/**
 * Borra un movimiento revirtiendo su efecto sobre los saldos.
 * Se usa una transacción porque la cuenta/meta pudo haber sido
 * eliminada después de crear el movimiento: solo se revierte lo que exista.
 */
export async function deleteMovimientoConReverso(uid: string, mov: Movimiento): Promise<void> {
  const monto = safeMonto(mov.monto);
  const ajustes: BalanceAdjustment[] = [];

    const cuentaId = (mov as any).cuentaId;
    const cuentaDestinoId = (mov as any).cuentaDestinoId;
    const metaId = (mov as any).metaId;

    if (mov.tipo === "GASTO" && cuentaId) {
      ajustes.push({ collectionName: "cuentas", id: cuentaId, field: "monto", delta: monto });
    } else if (mov.tipo === "INGRESO" && cuentaId) {
      ajustes.push({ collectionName: "cuentas", id: cuentaId, field: "monto", delta: -monto });
    } else if (mov.tipo === "TRANSFERENCIA") {
      if (cuentaId) ajustes.push({ collectionName: "cuentas", id: cuentaId, field: "monto", delta: monto });
      if (cuentaDestinoId) ajustes.push({ collectionName: "cuentas", id: cuentaDestinoId, field: "monto", delta: -monto });
    } else if (mov.tipo === "AHORRO_META") {
      if (cuentaId) ajustes.push({ collectionName: "cuentas", id: cuentaId, field: "monto", delta: monto });
      if (metaId) ajustes.push({ collectionName: "metas", id: metaId, field: "montoActual", delta: -monto });
    }

  await deleteMovementWithAdjustments(uid, mov.id, ajustes);
}
