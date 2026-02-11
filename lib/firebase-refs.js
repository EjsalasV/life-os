import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * LIFE OS - REFERENCIAS CENTRALIZADAS DE FIRESTORE
 * Centralizamos esto para evitar errores de escritura manual en los hooks.
 */

// Referencia al Documento del Usuario
export const getUserRef = (uid) => doc(db, 'users', uid);

// Colecciones Principales
export const getCuentasCol = (uid) => collection(db, 'users', uid, 'cuentas');
export const getFijosCol = (uid) => collection(db, 'users', uid, 'fijos');
export const getMetasCol = (uid) => collection(db, 'users', uid, 'metas');
export const getPresupuestosCol = (uid) => collection(db, 'users', uid, 'presupuestos');
export const getProductosCol = (uid) => collection(db, 'users', uid, 'productos');
export const getVentasCol = (uid) => collection(db, 'users', uid, 'ventas');
export const getHabitosCol = (uid) => collection(db, 'users', uid, 'habitos');
export const getPesoCol = (uid) => collection(db, 'users', uid, 'peso');
export const getMovimientosCol = (uid) => collection(db, 'users', uid, 'movimientos');

// Salud Diaria (Documento específico por fecha)
export const getSaludDiariaCol = (uid) => collection(db, 'users', uid, 'salud_diaria');
export const getSaludDiariaDoc = (uid, dateKey) => doc(db, 'users', uid, 'salud_diaria', dateKey);