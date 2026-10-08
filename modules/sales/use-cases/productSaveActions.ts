import { safeMonto } from "@/app/utils/helpers";
import { validateData, schemas } from "@/app/schemas";
import { FREE_PLAN_LIMITS } from "@/app/constants/plan-limits";
import { financeService } from "@/modules/finance/services/financeService";
import type { ProductForm } from "@/app/types";

export interface ProductSaveContext {
  uid: string;
  isPro: boolean;
  productosCount: number;
  productForm: ProductForm;
}

function firstError(errors: Record<string, string>): string {
  return String(Object.values(errors)[0] || "Datos inválidos");
}

export async function saveProducto({ uid, isPro, productosCount, productForm }: ProductSaveContext): Promise<void> {
  if (!productForm.id && !isPro && productosCount >= FREE_PLAN_LIMITS.productos) {
    throw new Error(`Límite de ${FREE_PLAN_LIMITS.productos} productos alcanzado. ¡Mejora a PRO! 🚀`);
  }
  const validation = validateData(schemas.producto, productForm);
  if (!validation.success) throw new Error(firstError(validation.errors));
  const stockFinal = Math.max(0, parseInt(productForm.stock) || 0);
  if (productForm.id) {
    if (!isPro) throw new Error("La edición es función PRO 💎");
    await financeService.updateEntity(uid, "productos", productForm.id, {
      nombre: productForm.nombre,
      precioVenta: safeMonto(productForm.precioVenta),
      costo: safeMonto(productForm.costo),
      stock: stockFinal
    }, ...(productForm.originalStock === undefined ? [] : [productForm.originalStock]));
    return;
  }
  await financeService.addEntity(uid, "productos", {
    nombre: productForm.nombre,
    precioVenta: safeMonto(productForm.precioVenta),
    costo: safeMonto(productForm.costo),
    stock: stockFinal,
    timestamp: financeService.timestamp()
  });
}
