// app/utils/helpers.js

/**
 * Convierte cualquier formato de fecha (Firebase Timestamp, Date, segundos) a milisegundos.
 */
export const getTime = (t) => {
  if (!t) return 0;
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (t instanceof Date) return t.getTime();
  if (t.seconds) return t.seconds * 1000;
  return 0;
};

/**
 * Devuelve la fecha de hoy en formato string "YYYY-MM-DD" (clave para el registro diario).
 */
export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Convierte cualquier input (texto, null, undefined) a un número flotante seguro.
 * Evita el error NaN (Not a Number).
 */
export const safeMonto = (m) => {
  if (!m) return 0;
  const n = parseFloat(m); 
  return isNaN(n) ? 0 : n;
};

/**
 * Formatea un número como moneda USD (Ej: $ 1,250.50).
 */
export const formatMoney = (m) => {
  return safeMonto(m).toLocaleString('es-EC', { 
    style: 'currency', 
    currency: 'USD' 
  });
};

/**
 * Helper extra para formatear fecha corta (Ej: "12 ene").
 * Útil para las tarjetas de movimientos.
 */
export const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(getTime(timestamp));
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
};

// === CATEGORÍAS ===
import { Briefcase, Gamepad2, Coffee, Car, Heart, Home, Sparkles } from 'lucide-react';

export const CATEGORIAS = [
  { id: 'trabajo', label: 'Trabajo', icon: Briefcase, color: 'bg-emerald-500' },
  { id: 'ocio', label: 'Ocio', icon: Gamepad2, color: 'bg-indigo-500' },
  { id: 'comida', label: 'Alimentación', icon: Coffee, color: 'bg-orange-500' },
  { id: 'transporte', label: 'Transporte', icon: Car, color: 'bg-blue-500' },
  { id: 'salud', label: 'Salud', icon: Heart, color: 'bg-rose-500' },
  { id: 'hogar', label: 'Hogar', icon: Home, color: 'bg-amber-600' },
  { id: 'otros', label: 'Otros', icon: Sparkles, color: 'bg-gray-500' },
];