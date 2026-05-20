import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  updateDoc
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
  }
};
