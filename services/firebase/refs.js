import { collection, doc } from "firebase/firestore";
import { db } from "./client";

export const getUserRef = (uid) => doc(db, "users", uid);
export const getCuentasCol = (uid) => collection(db, "users", uid, "cuentas");
export const getTarjetasCol = (uid) => collection(db, "users", uid, "tarjetas");
export const getFijosCol = (uid) => collection(db, "users", uid, "fijos");
export const getMetasCol = (uid) => collection(db, "users", uid, "metas");
export const getPresupuestosCol = (uid) => collection(db, "users", uid, "presupuestos");
export const getProductosCol = (uid) => collection(db, "users", uid, "productos");
export const getVentasCol = (uid) => collection(db, "users", uid, "ventas");
export const getHabitosCol = (uid) => collection(db, "users", uid, "habitos");
export const getPesoCol = (uid) => collection(db, "users", uid, "peso");
export const getMovimientosCol = (uid) => collection(db, "users", uid, "movimientos");
export const getSaludDiariaCol = (uid) => collection(db, "users", uid, "salud_diaria");
export const getSaludDiariaDoc = (uid, dateKey) => doc(db, "users", uid, "salud_diaria", dateKey);
