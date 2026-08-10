import { limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, where } from "firebase/firestore";
import {
  getCuentasCol, getFijosCol, getHabitosCol, getMetasCol, getMovimientosCol,
  getPesoCol, getPresupuestosCol, getProductosCol, getTarjetasCol, getUserRef, getVentasCol
} from "@/services/firebase/refs";
import { db } from "./client";

const withIds = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

export function subscribeDashboard(uid, setters, onError) {
  const listen = (reference, setter) => onSnapshot(
    reference,
    (snapshot) => setter(withIds(snapshot)),
    onError
  );
  const subscriptions = [
    onSnapshot(getUserRef(uid), (item) => {
      if (item.exists()) setters.setUserStats(item.data().stats || { lastActivity: null, currentStreak: 0 });
    }, onError),
    listen(query(getCuentasCol(uid), limit(100)), setters.setCuentas),
    listen(query(getTarjetasCol(uid), limit(100)), setters.setTarjetas),
    listen(query(getFijosCol(uid), limit(100)), setters.setFijos),
    listen(query(getMetasCol(uid), limit(100)), setters.setMetas),
    listen(query(getPresupuestosCol(uid), limit(100)), setters.setPresupuestos),
    listen(query(getProductosCol(uid), limit(250)), setters.setProductos),
    listen(query(getVentasCol(uid), orderBy("timestamp", "desc"), limit(200)), setters.setVentas),
    listen(query(getHabitosCol(uid), limit(100)), setters.setHabitos),
    listen(query(getPesoCol(uid), orderBy("timestamp", "desc"), limit(100)), setters.setHistorialPeso)
  ];
  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

export function subscribeMovimientos(uid, start, end, maxItems, onValue, onError) {
  const movimientosQuery = query(
    getMovimientosCol(uid),
    orderBy("timestamp", "desc"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end),
    limit(maxItems)
  );
  return onSnapshot(movimientosQuery, (snapshot) => onValue(withIds(snapshot)), onError);
}

export async function updateUserStreak(uid) {
  return runTransaction(db, async (transaction) => {
    const userRef = getUserRef(uid);
    const userSnapshot = await transaction.get(userRef);
    const now = new Date();
    const startOfDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    if (!userSnapshot.exists()) {
      transaction.set(userRef, { stats: { lastActivity: serverTimestamp(), currentStreak: 1 } }, { merge: true });
      return true;
    }

    const userData = userSnapshot.data();
    const last = userData.stats?.lastActivity?.toDate?.() || null;
    const todayTimestamp = startOfDate(now);
    const lastTimestamp = last ? startOfDate(last) : 0;
    if (todayTimestamp === lastTimestamp) return false;

    const currentStreak = userData.stats?.currentStreak || 0;
    transaction.update(userRef, {
      "stats.lastActivity": serverTimestamp(),
      "stats.currentStreak": lastTimestamp === todayTimestamp - 86_400_000 ? currentStreak + 1 : 1
    });
    return true;
  });
}

export function finishOnboarding(uid) {
  return setDoc(getUserRef(uid), { isNew: false }, { merge: true });
}
