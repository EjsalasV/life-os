import { Timestamp } from 'firebase/firestore';

// ==================== FIREBASE TYPES ====================

export interface FirebaseUser {
    uid: string;
    email: string;
    name: string;
    plan: 'free' | 'pro';
    isNew?: boolean;
    stats?: UserStats;
    createdAt?: Date;
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
    tipo: 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';
    cuentaId: string;
    cuentaDestinoId?: string;
    cuentaNombre: string;
    categoria: Categoria;
    timestamp: Date | Timestamp;
    ventaRefId?: string;
}

export interface Fijo {
    id: string;
    nombre: string;
    monto: number;
    periodicidad: 'Mensual' | 'Semanal' | 'Anual';
    diaCobro: string;
    timestamp: Timestamp;
}

export interface Meta {
    id: string;
    nombre: string;
    montoObjetivo: number;
    montoActual: number;
    timestamp: Timestamp;
}

export interface Presupuesto {
    id: string;
    categoria: Categoria;
    limite: number;
    timestamp: Timestamp;
}

export type Categoria =
    | 'comida'
    | 'transporte'
    | 'entretenimiento'
    | 'salud'
    | 'educacion'
    | 'servicios'
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

export interface Nutriente {
    id: string;
    nombre: string;
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
    vitaminas: {
        [key: string]: number;
    };
    minerales: {
        [key: string]: number;
    };
    compatibilidad?: string[];
    indices?: {
        indiceInflamatorio?: number;
        biodisponibilidad?: number;
    };
}

export interface AlimentoRegistrado {
    id: string;
    alimentoId: string;
    nombre: string;
    tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
    cantidad: number;
    unidad: string;
    hora: string;
    caloriasTotales: number;
    nutrientes: Nutriente;
    impactoBateria: number;
}

export interface MacrosDelDia {
    fecha: string;
    caloriasTotales: number;
    proteinaTotal: number;
    carbohidratosTotal: number;
    grasasTotal: number;
    vitaminasConsumo: { [key: string]: number };
    mineralesConsumo: { [key: string]: number };
    indiceInflamatorioPromedio: number;
    alimentos: AlimentoRegistrado[];
}

export interface SaludHoy extends MacrosDelDia {
    fecha: string;
    bateria: number;
    agua: number;
    animo: 'mal' | 'normal' | 'genial';
    ejercicioMinutos: number;
    comidas: {
        desayuno?: 'nutritivo' | 'normal' | 'procesado';
        almuerzo?: 'nutritivo' | 'normal' | 'procesado';
        cena?: 'nutritivo' | 'normal' | 'procesado';
    };
    ayunoInicio?: number;
    habitosChecks: string[];
    suenoHoras?: number;
    calidadSueno?: 'mala' | 'regular' | 'buena' | 'excelente';
    estres?: number;
    recuperacionTiempoEstimado?: string;
    prediccionBateriaManana?: number;
    alertasNutricionales?: string[];
    consejosIA?: string[];
}

export interface Habito {
    id: string;
    nombre: string;
    frecuencia: 'Diario' | 'Semanal' | 'Mensual';
    iconType: string;
    timestamp: Timestamp;
}

export interface RegistroPeso {
    id: string;
    peso: number;
    timestamp: Timestamp;
}

export interface HistorialSalud extends MacrosDelDia {
    id: string;
    fecha: string;
    bateria: number;
    agua: number;
    habitosChecks: string[];
    suenoHoras?: number;
    calidadSueno?: string;
}

export interface ConsejosIA {
    id: string;
    tipo: 'nutricion' | 'ejercicio' | 'sueño' | 'habitos' | 'hidratacion';
    contenido: string;
    prioridad: 'baja' | 'media' | 'alta';
    basadoEn: string[];
    timestamp: Timestamp;
}

export interface CompatibilidadNutricional {
    alimento1: string;
    alimento2: string;
    sinergiaIndex: number;
    descripcion: string;
    impacto: 'positivo' | 'negativo' | 'neutral';
}

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
export type SaludSubTab = 'vitalidad' | 'nutricion' | 'recetas' | 'deficit' | 'habitos' | 'ia-coach' | 'historial';

// ==================== FORM TYPES ====================

export interface FinanceForm {
    id?: string;
    nombre: string;
    monto: string;
    tipo: 'GASTO' | 'INGRESO' | 'TRANSFERENCIA';
    cuentaId: string;
    cuentaDestinoId: string;
    categoria: Categoria;
    periodicidad: 'Mensual' | 'Semanal' | 'Anual';
    diaCobro: string;
    limite: string;
}

export interface ProductForm {
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

export interface HealthForm {
    tipoEjercicio: string;
    duracion: string;
    tipoComida: string;
    calidadComida: string;
    horasSueno: string;
    calidadSueno: string;
    frecuencia: 'Diario' | 'Semanal' | 'Mensual';
    iconType: string;
    nombre: string;
    peso: string;
}

// ==================== FILTER TYPES ====================

export interface FilterDate {
    month: number;
    year: number;
}

// ==================== HELPER TYPES ====================

export type TimestampInput = Date | Timestamp | { seconds: number; nanoseconds: number };
