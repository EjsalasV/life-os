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

  updateEntity(uid, col, id, payload) {
    return updateDoc(userDoc(uid, col, id), payload);
  },

  deleteEntity(uid, col, id) {
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
    const batch = writeBatch(db);
    batch.update(userDoc(uid, "cuentas", cuentaId), { monto: increment(delta) });
    batch.set(doc(userCol(uid, "movimientos")), movimiento);
    return batch.commit();
  },

  transferirEntreCuentas(uid, { origenId, destinoId, monto, movimiento }) {
    const batch = writeBatch(db);
    batch.update(userDoc(uid, "cuentas", origenId), { monto: increment(-monto) });
    batch.update(userDoc(uid, "cuentas", destinoId), { monto: increment(monto) });
    batch.set(doc(userCol(uid, "movimientos")), movimiento);
    return batch.commit();
  },

  aportarAhorroMeta(uid, { cuentaId, metaId, monto, movimiento }) {
    const batch = writeBatch(db);
    batch.update(userDoc(uid, "cuentas", cuentaId), { monto: increment(-monto) });
    batch.update(userDoc(uid, "metas", metaId), { montoActual: increment(monto) });
    batch.set(doc(userCol(uid, "movimientos")), movimiento);
    return batch.commit();
  }
};
