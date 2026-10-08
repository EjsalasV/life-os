// app/utils/helpers.ts
import { Briefcase, Gamepad2, Coffee, Car, Heart, Home, Sparkles, LucideIcon } from 'lucide-react';
import type { Categoria } from '@/modules/finance/types';
import type { TimestampInput } from '@/app/types';
import { FINANCE_CATEGORY_METADATA } from '@/modules/finance/constants/financeCategories';

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

export const getTodayKey = (date: Date = new Date()): string => {
    const d = date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const toCents = (amount: number | string): number => Math.round(safeMonto(amount) * 100);
export const fromCents = (cents: number): number => cents / 100;

export const safeMonto = (m: number | string | null | undefined): number => {
    if (!m) return 0;
    const n = Number(m);
    return Number.isFinite(n) ? n : 0;
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
    emoji?: string;
    hex?: string;
}

export const CATEGORIAS: CategoriaInfo[] = [
    { ...FINANCE_CATEGORY_METADATA[0], icon: Coffee, color: 'bg-orange-500', hex: '#f97316' },
    { ...FINANCE_CATEGORY_METADATA[1], icon: Car, color: 'bg-blue-500', hex: '#3b82f6' },
    { ...FINANCE_CATEGORY_METADATA[2], icon: Gamepad2, color: 'bg-indigo-500', hex: '#6366f1' },
    { ...FINANCE_CATEGORY_METADATA[3], icon: Heart, color: 'bg-rose-500', hex: '#ef4444' },
    { ...FINANCE_CATEGORY_METADATA[4], icon: Briefcase, color: 'bg-emerald-500', hex: '#10b981' },
    { ...FINANCE_CATEGORY_METADATA[5], icon: Home, color: 'bg-amber-600', hex: '#d97706' },
    { ...FINANCE_CATEGORY_METADATA[6], icon: Sparkles, color: 'bg-gray-500', hex: '#6b7280' },
];
