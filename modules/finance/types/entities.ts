import type { Timestamp } from "firebase/firestore";

export type Categoria = "comida" | "transporte" | "entretenimiento" | "salud" | "educacion" | "servicios" | "ventas" | "otros";

export interface Cuenta { id: string; nombre: string; monto: number; timestamp: Timestamp; }
export interface Movimiento {
  id: string; nombre: string; monto: number;
  tipo: "INGRESO" | "GASTO" | "TRANSFERENCIA" | "AHORRO_META" | "PAGO_TARJETA";
  cuentaId?: string; cuentaDestinoId?: string; cuentaNombre?: string; categoria?: Categoria;
  tarjetaId?: string; tarjetaNombre?: string; medioPago?: "TARJETA_CREDITO";
  timestamp: Date | Timestamp; ventaRefId?: string; metaId?: string;
}
export interface Fijo { id: string; nombre: string; monto: number; periodicidad: "Mensual" | "Semanal" | "Quincenal" | "Anual"; diaCobro: string; cuentaId?: string | null; timestamp: Timestamp; }
export interface Meta { id: string; nombre: string; montoObjetivo: number; montoActual: number; timestamp: Timestamp; }
export interface PresupuestoHistorial { mes: number; año: number; limite: number; gastado: number; superado: boolean; }
export interface PresupuestoAlerta { id: string; tipo: "advertencia" | "critico"; porcentaje: number; fecha: Timestamp; mensaje: string; }
export interface Presupuesto { id: string; categoria: Categoria; limite: number; timestamp: Timestamp; historial?: PresupuestoHistorial[]; ultimaActualizacion?: Timestamp; alertas?: PresupuestoAlerta[]; }
export interface BalanceMes { ingresos: number; gastos: number; balance: number; proyeccion: number; }
