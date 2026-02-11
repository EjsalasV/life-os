// app/utils/helpers.js
import { Briefcase, Gamepad2, Coffee, Car, Heart, Home, Sparkles } from 'lucide-react';

/**
 * Convierte cualquier formato de fecha a milisegundos.
 * FIX: Si es null (movimiento nuevo), devuelve el tiempo actual para que aparezca primero.
 */
export const getTime = (t) => {
  if (!t) return Date.now(); // <-- FIX para movimientos nuevos
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (t instanceof Date) return t.getTime();
  if (t.seconds) return t.seconds * 1000;
  return Date.now();
};

export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const toCents = (amount) => Math.round(safeMonto(amount) * 100);
export const fromCents = (cents) => cents / 100;

export const safeMonto = (m) => {
  if (!m) return 0;
  const n = parseFloat(m); 
  return isNaN(n) ? 0 : n;
};

export const formatMoney = (m) => {
  return safeMonto(m).toLocaleString('es-EC', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  });
};

export const formatDateShort = (timestamp) => {
  if (!timestamp) return 'Ahora';
  const date = new Date(getTime(timestamp));
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
};

export const CATEGORIAS = [
  { id: 'trabajo', label: 'Trabajo', icon: Briefcase, color: 'bg-emerald-500' },
  { id: 'ocio', label: 'Ocio', icon: Gamepad2, color: 'bg-indigo-500' },
  { id: 'comida', label: 'Alimentación', icon: Coffee, color: 'bg-orange-500' },
  { id: 'transporte', label: 'Transporte', icon: Car, color: 'bg-blue-500' },
  { id: 'salud', label: 'Salud', icon: Heart, color: 'bg-rose-500' },
  { id: 'hogar', label: 'Hogar', icon: Home, color: 'bg-amber-600' },
  { id: 'otros', label: 'Otros', icon: Sparkles, color: 'bg-gray-500' },
];