import { z } from "zod";
import { numericText, validMoney } from "@/lib/schemaPrimitives";
import { FINANCE_CATEGORY_METADATA } from "@/modules/finance/constants/financeCategories";

const financeCategoryIds = FINANCE_CATEGORY_METADATA.map(({ id }) => id) as [string, ...string[]];
const financeCategorySchema = z.enum(financeCategoryIds);
const movementCategorySchema = z.union([financeCategorySchema, z.literal("ventas")]);

export const movimientoSchema = z.object({ nombre: z.string().trim().min(1, "El nombre es requerido").max(200, "El nombre es demasiado largo"), monto: numericText.refine((value) => validMoney(value), { message: "El monto debe ser un número positivo" }), tipo: z.enum(["INGRESO", "GASTO", "TRANSFERENCIA", "AHORRO_META"]), cuentaId: z.string().min(1, "Selecciona una cuenta"), cuentaDestinoId: z.string().optional(), categoria: movementCategorySchema }).refine((data) => data.tipo !== "TRANSFERENCIA" || !!data.cuentaDestinoId, { message: "Las transferencias requieren una cuenta destino", path: ["cuentaDestinoId"] });
export const cuentaSchema = z.object({ nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"), monto: numericText.refine((value) => validMoney(value, false), { message: "El monto debe ser un número válido" }) });
export const fijoSchema = z.object({ nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"), monto: numericText.refine((value) => validMoney(value), { message: "El monto debe ser un número positivo" }), periodicidad: z.enum(["Mensual", "Semanal", "Quincenal", "Anual"]), diaCobro: z.string().refine((value) => { const number = Number(value); return Number.isInteger(number) && number >= 1 && number <= 31; }, { message: "El día debe estar entre 1 y 31" }), cuentaId: z.string().optional() });
export const metaSchema = z.object({ nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"), montoObjetivo: numericText.refine((value) => validMoney(value), { message: "El monto objetivo debe ser positivo" }), montoActual: numericText.refine((value) => validMoney(value, false), { message: "El monto actual debe ser válido" }).optional() });
export const presupuestoSchema = z.object({ categoria: financeCategorySchema, limite: numericText.refine((value) => validMoney(value), { message: "El límite debe ser un número positivo" }) });
