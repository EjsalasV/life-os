import type { Categoria } from "./entities";

export interface FinanceForm {
  id?: string; nombre: string; monto: string;
  tipo: "GASTO" | "INGRESO" | "TRANSFERENCIA" | "AHORRO_META";
  cuentaId: string; cuentaDestinoId: string; categoria: Categoria;
  periodicidad: "Mensual" | "Semanal" | "Quincenal" | "Anual";
  diaCobro: string; limite: string; saldo?: string; banco?: string;
}
