// Compatibility barrel. Canonical schemas live with their owning domain.
export { validateData } from "@/lib/validation";
export type { ValidationResult } from "@/lib/validation";
export { movimientoSchema, cuentaSchema, fijoSchema, metaSchema, presupuestoSchema } from "@/modules/finance/schemas/financeSchemas";
export { productoSchema, ventaSchema } from "@/modules/sales/schemas/salesSchemas";
export { habitoSchema, pesoSchema, saludDiariaSchema } from "@/modules/health/schemas/healthSchemas";

import { movimientoSchema, cuentaSchema, fijoSchema, metaSchema, presupuestoSchema } from "@/modules/finance/schemas/financeSchemas";
import { productoSchema, ventaSchema } from "@/modules/sales/schemas/salesSchemas";
import { habitoSchema, pesoSchema, saludDiariaSchema } from "@/modules/health/schemas/healthSchemas";

export const schemas = {
  movimiento: movimientoSchema,
  cuenta: cuentaSchema,
  fijo: fijoSchema,
  meta: metaSchema,
  presupuesto: presupuestoSchema,
  producto: productoSchema,
  venta: ventaSchema,
  habito: habitoSchema,
  peso: pesoSchema,
  saludDiaria: saludDiariaSchema
};
