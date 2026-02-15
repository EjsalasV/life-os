// Type definitions for page.tsx
export interface FinanceForm {
    nombre: string;
    monto: string;
    tipo: 'INGRESO' | 'GASTO';
    cuentaId: string;
    cuentaDestinoId: string;
    categoria: string;
    periodicidad: string;
    diaCobro: string;
    limite: string;
}

export interface ProductForm {
    id?: string;
    nombre: string;
    precio: string;
    stock: string;
    categoria: string;
}

export interface HealthForm {
    peso: string;
    nota: string;
}

export interface PosForm {
    productoId: string;
    cantidad: string;
}

export interface FilterDate {
    month: number;
    year: number;
}

export interface CartItem {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface UserStats {
    currentStreak: number;
    bestStreak: number;
    lastNoSpendDate: string;
}
