// app/utils/helpers.ts
import { Briefcase, Gamepad2, Coffee, Car, Heart, Home, Sparkles, LucideIcon } from 'lucide-react';
import type { Categoria, TimestampInput } from '@/app/types';

/**
 * Convierte cualquier formato de fecha a milisegundos.
 * FIX: Si es null (movimiento nuevo), devuelve el tiempo actual para que aparezca primero.
 */
export const getTime = (t: TimestampInput | null | undefined): number => {
    if (!t) return Date.now(); // FIX para movimientos nuevos
    if (typeof (t as any).toMillis === 'function') return (t as any).toMillis();
    if (t instanceof Date) return t.getTime();
    if ('seconds' in t) return t.seconds * 1000;
    return Date.now();
};

export const getTodayKey = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const toCents = (amount: number | string): number => Math.round(safeMonto(amount) * 100);
export const fromCents = (cents: number): number => cents / 100;

export const safeMonto = (m: number | string | null | undefined): number => {
    if (!m) return 0;
    const n = parseFloat(m.toString());
    return isNaN(n) ? 0 : n;
};

export const formatMoney = (m: number | string | null | undefined): string => {
    return safeMonto(m).toLocaleString('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });
};

export const formatDateShort = (timestamp: TimestampInput | null | undefined): string => {
    if (!timestamp) return 'Ahora';
    const date = new Date(getTime(timestamp));
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
};

export interface CategoriaInfo {
    id: Categoria;
    label: string;
    icon: LucideIcon;
    color: string;
}

export const CATEGORIAS: CategoriaInfo[] = [
    { id: 'comida', label: 'Alimentación', icon: Coffee, color: 'bg-orange-500' },
    { id: 'transporte', label: 'Transporte', icon: Car, color: 'bg-blue-500' },
    { id: 'entretenimiento', label: 'Ocio', icon: Gamepad2, color: 'bg-indigo-500' },
    { id: 'salud', label: 'Salud', icon: Heart, color: 'bg-rose-500' },
    { id: 'educacion', label: 'Educación', icon: Briefcase, color: 'bg-emerald-500' },
    { id: 'servicios', label: 'Hogar', icon: Home, color: 'bg-amber-600' },
    { id: 'otros', label: 'Otros', icon: Sparkles, color: 'bg-gray-500' },
];
