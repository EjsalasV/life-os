import type { Timestamp } from "firebase/firestore";

// Compatibility barrel. Canonical domain contracts live under modules/*/types.
export type { FirebaseUser, UserStats, PhysicalProfile, UserWithPhysicalProfile } from "@/modules/auth/types/user";
export type { Cuenta, Movimiento, Fijo, Meta, PresupuestoHistorial, PresupuestoAlerta, Presupuesto, Categoria, BalanceMes, FinanceForm } from "@/modules/finance/types";
export type { Producto, Venta, ItemVenta, ItemCarrito, ProductForm, PosForm } from "@/modules/sales/types";
export type { Nutriente, AlimentoRegistrado, MacrosDelDia, SaludHoy, Habito, RegistroPeso, HistorialSalud, ConsejosIA, CompatibilidadNutricional, HealthForm } from "@/modules/health/types/healthTypes";

export type ModalType = "movimiento" | "cuenta" | "fijo" | "meta" | "ahorroMeta" | "presupuesto" | "transferencia" | "producto" | "cobrar" | "habito" | "peso" | null;
export interface Toast { message: string; type: "success" | "error" | "info"; }
export type TabType = "finanzas" | "ventas" | "salud" | "settings";
export type FinSubTab = "control" | "billetera" | "futuro";
export type VentasSubTab = "terminal" | "inventario" | "historial";
export type SaludSubTab = "vitalidad" | "nutricion" | "recetas" | "deficit" | "habitos" | "herramientas" | "ia-coach" | "comunidad" | "refrigerador" | "leaderboards" | "historial";
export interface FilterDate { month: number; year: number; }
export type TimestampInput = Date | Timestamp | { seconds: number; nanoseconds: number };
