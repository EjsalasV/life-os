import { saveBalancedMovement } from "./balanceService";
import { deleteEmptyAccount, deleteEmptyGoal, updateProduct } from "./entityIntegrityService";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "@/services/firebase/client";

const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);
const userCol = (uid, col) => collection(db, "users", uid, col);
const userRoot = (uid) => doc(db, "users", uid);

export const financeService = {
  timestamp() {
    return serverTimestamp();
  },

  addEntity(uid, col, payload) {
    return addDoc(userCol(uid, col), payload);
  },

  updateEntity(uid, col, id, payload, expectedStock) {
    if (col === "productos" && expectedStock !== undefined) return updateProduct(uid, id, payload, expectedStock);
    return updateDoc(userDoc(uid, col, id), payload);
  },

  deleteEntity(uid, col, id) {
    if (col === "cuentas") return deleteEmptyAccount(uid, id);
    if (col === "metas") return deleteEmptyGoal(uid, id);
    return deleteDoc(userDoc(uid, col, id));
  },

  updateUser(uid, payload) {
    return updateDoc(userRoot(uid), payload);
  },

  updateCuentaMonto(uid, cuentaId, delta) {
    return updateDoc(userDoc(uid, "cuentas", cuentaId), { monto: increment(delta) });
  },

  updateMetaMontoActual(uid, metaId, delta) {
    return updateDoc(userDoc(uid, "metas", metaId), { montoActual: increment(delta) });
  },

  addMovimiento(uid, payload) {
    return addDoc(userCol(uid, "movimientos"), payload);
  },

  // Ajusta el saldo de la cuenta y registra el movimiento en un solo batch:
  // o se aplican ambos o ninguno.
  registrarMovimientoConSaldo(uid, { cuentaId, delta, movimiento }) {
    return saveBalancedMovement(uid, movimiento, [{ col: "cuentas", id: cuentaId, field: "monto", delta }]);
  },

  transferirEntreCuentas(uid, { origenId, destinoId, monto, movimiento }) {
    return saveBalancedMovement(uid, movimiento, [
      { col: "cuentas", id: origenId, field: "monto", delta: -monto },
      { col: "cuentas", id: destinoId, field: "monto", delta: monto }
    ], true);
  },

  aportarAhorroMeta(uid, { cuentaId, metaId, monto, movimiento }) {
    return saveBalancedMovement(uid, movimiento, [
      { col: "cuentas", id: cuentaId, field: "monto", delta: -monto },
      { col: "metas", id: metaId, field: "montoActual", delta: monto }
    ], true);
  }
};
