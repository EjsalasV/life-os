import { Timestamp } from 'firebase/firestore';
import type { PhysicalProfile } from './user';

// ==================== FIREBASE TYPES ====================

export interface FirebaseUser {
    uid: string;
    email: string;
    name: string;
    plan: 'free' | 'pro';
    isNew?: boolean;
    stats?: UserStats;
    createdAt?: Date;
    physicalProfile?: PhysicalProfile;
}

export interface UserStats {
    lastActivity: Timestamp | null;
    currentStreak: number;
}

// ==================== FINANZAS TYPES ====================

export interface Cuenta {
    id: string;
    nombre: string;
    monto: number;
    timestamp: Timestamp;
}

export interface Movimiento {
    id: string;
    nombre: string;
    monto: number;
    tipo: 'INGRESO' | 'GASTO' | 'TRANSFERENCIA' | 'AHORRO_META' | 'PAGO_TARJETA';
    cuentaId?: string;
    cuentaDestinoId?: string;
    cuentaNombre?: string;
    categoria?: Categoria;
    tarjetaId?: string;
    tarjetaNombre?: string;
    medioPago?: 'TARJETA_CREDITO';
    timestamp: Date | Timestamp;
    ventaRefId?: string;
    metaId?: string;
}

export interface Fijo {
    id: string;
    nombre: string;
    monto: number;
    periodicidad: 'Mensual' | 'Semanal' | 'Quincenal' | 'Anual';
    diaCobro: string;
    cuentaId?: string | null;
    timestamp: Timestamp;
}

export interface Meta {
    id: string;
    nombre: string;
    montoObjetivo: number;
    montoActual: number;
    timestamp: Timestamp;
}

export interface PresupuestoHistorial {
    mes: number;
    año: number;
    limite: number;
    gastado: number;
    superado: boolean;
}

export interface PresupuestoAlerta {
    id: string;
    tipo: 'advertencia' | 'critico';
    porcentaje: number;
    fecha: Timestamp;
    mensaje: string;
}

export interface Presupuesto {
    id: string;
    categoria: Categoria;
    limite: number;
    timestamp: Timestamp;
    historial?: PresupuestoHistorial[];
    ultimaActualizacion?: Timestamp;
    alertas?: PresupuestoAlerta[];
}

export type Categoria =
    | 'comida'
    | 'transporte'
    | 'entretenimiento'
    | 'salud'
    | 'educacion'
    | 'servicios'
    | 'ventas'
    | 'otros';

export interface BalanceMes {
    ingresos: number;
    gastos: number;
    balance: number;
    proyeccion: number;
}

// ==================== VENTAS TYPES ====================

export interface Producto {
    id: string;
    nombre: string;
    precioVenta: number;
    costo: number;
    stock: number;
    timestamp: Timestamp;
}

export interface Venta {
    id: string;
    cliente: string;
    items: ItemVenta[];
    total: number;
    cuentaId: string;
    timestamp: Timestamp;
}

export interface ItemVenta {
    id: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface ItemCarrito extends ItemVenta {
    stock: number;
}

// ==================== SALUD TYPES ====================
export type {
    Nutriente, AlimentoRegistrado, MacrosDelDia, SaludHoy, Habito, RegistroPeso,
    HistorialSalud, ConsejosIA, CompatibilidadNutricional, HealthForm
} from '@/modules/health/types/healthTypes';

// ==================== UI TYPES ====================

export type ModalType =
    | 'movimiento'
    | 'cuenta'
    | 'fijo'
    | 'meta'
    | 'ahorroMeta'
    | 'presupuesto'
    | 'transferencia'
    | 'producto'
    | 'cobrar'
    | 'habito'
    | 'peso'
    | null;

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

export type TabType = 'finanzas' | 'ventas' | 'salud' | 'settings';
export type FinSubTab = 'control' | 'billetera' | 'futuro';
export type VentasSubTab = 'terminal' | 'inventario' | 'historial';
export type SaludSubTab =
    | 'vitalidad'
    | 'nutricion'
    | 'recetas'
    | 'deficit'
    | 'habitos'
    | 'herramientas'
    | 'ia-coach'
    | 'comunidad'
    | 'refrigerador'
    | 'leaderboards'
    | 'historial';

// ==================== FORM TYPES ====================

export interface FinanceForm {
    id?: string;
    nombre: string;
    monto: string;
    tipo: 'GASTO' | 'INGRESO' | 'TRANSFERENCIA' | 'AHORRO_META';
    cuentaId: string;
    cuentaDestinoId: string;
    categoria: Categoria;
    periodicidad: 'Mensual' | 'Semanal' | 'Quincenal' | 'Anual';
    diaCobro: string;
    limite: string;
    saldo?: string;
    banco?: string;
}

export interface ProductForm {
    originalStock?: number;
    id?: string;
    nombre: string;
    precioVenta: string;
    costo: string;
    stock: string;
}

export interface PosForm {
    cliente: string;
    cuentaId: string;
    id: string | null;
}

// ==================== FILTER TYPES ====================

export interface FilterDate {
    month: number;
    year: number;
}

// ==================== HELPER TYPES ====================

export type TimestampInput = Date | Timestamp | { seconds: number; nanoseconds: number };
