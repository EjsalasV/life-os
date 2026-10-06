import {
  saveAhorroMeta,
  saveCuenta,
  saveFijo,
  saveHabito,
  saveMeta,
  saveMovimiento,
  savePeso,
  savePresupuesto,
  saveProducto,
  saveTarjeta,
  saveTransferencia
} from './financeSaveActions';
import type { FinanceSaveAction } from './financeActionTypes';

/** Registro único entre la acción de UI y el caso de uso de Finanzas. */
export const financeSaveActions: Record<string, FinanceSaveAction> = {
  productos: saveProducto,
  movimientos: saveMovimiento,
  cuentas: saveCuenta,
  peso: savePeso,
  fijos: saveFijo,
  metas: saveMeta,
  presupuestos: savePresupuesto,
  habitos: saveHabito,
  transferencia: saveTransferencia,
  ahorroMeta: saveAhorroMeta,
  tarjetas: saveTarjeta
};
