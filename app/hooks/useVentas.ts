// app/hooks/useVentas.ts
"use client";

import { useRef, useState } from "react";
import { userError } from "@/lib/userError";
import { readPendingCheckout } from "@/services/api/pendingCheckout";
import { createSaleSecurely } from "@/services/api/backendService";
import type { FirebaseUser } from "@/modules/auth/types/user";
import type { Producto, ItemCarrito, Venta, PosForm } from "@/modules/sales/types";
import type { Movimiento, Cuenta } from "@/modules/finance/types";
import {
  validateCheckout,
  validateVentaSchema,
  checkoutEdit,
  checkoutCreate
} from "@/modules/sales/use-cases/checkout";
import { recordPetEvent } from "@/modules/pet/services/petService";
import { cancelSale } from "@/modules/sales/use-cases/cancelSale";
import { financeService } from "@/modules/finance/services/financeService";
import { saveProducto } from "@/modules/sales/use-cases/productSaveActions";
import { reportProductEvent } from "@/services/observability/reporter";

interface UseVentasContext {
  user: FirebaseUser | null;
  productos: Producto[];
  carrito: ItemCarrito[];
  setCarrito: (carrito: ItemCarrito[]) => void;
  ventas: Venta[];
  cuentas: Cuenta[];
  posForm: PosForm;
  setPosForm: (form: PosForm) => void;
  setModalOpen: (modal: any) => void;
  setErrorMsg: (msg: string, type?: "success" | "error" | "info") => void;
  movimientos: Movimiento[];
}

export default function useVentas(ctx: UseVentasContext) {
  const {
    user, productos, carrito, setCarrito, ventas, cuentas,
    posForm, setPosForm, setModalOpen, setErrorMsg, movimientos
  } = ctx;

  const isPro = user?.plan === "pro";
  const checkoutLock = useRef(false);
  const productLock = useRef(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  let hasPendingCheckout = false;
  try { hasPendingCheckout = !!user && !!readPendingCheckout(user.uid); } catch { hasPendingCheckout = true; }
  const retryPendingCheckout = async () => {
    if (!user || checkoutLock.current) return;
    checkoutLock.current = true;
    setIsCheckingOut(true);
    try {
      const pending = readPendingCheckout(user.uid);
      if (!pending) return;
      const result = await createSaleSecurely(pending);
      setCarrito([]);
      setPosForm({ cliente: "", cuentaId: "", id: null });
      setModalOpen(null);
      setErrorMsg("Cobro confirmado: ticket #" + result.reciboId);
    } catch (error) { setErrorMsg(userError(error), "error"); }
    finally { checkoutLock.current = false; setIsCheckingOut(false); }
  };

  const handleCheckout = async (): Promise<void> => {
    if (!user || checkoutLock.current) return;
    if (hasPendingCheckout) { await retryPendingCheckout(); return; }

    const validationError = validateCheckout({
      isPro,
      posForm,
      ventas,
      carrito,
      productos
    });

    if (validationError) {
      setErrorMsg(validationError, "error");
      return;
    }

    // El schema solo aplica a ventas nuevas (la edición no lleva carrito)
    if (!posForm.id) {
      const schemaError = validateVentaSchema(posForm, carrito);
      if (schemaError) {
        setErrorMsg(schemaError, "error");
        return;
      }
    }
    checkoutLock.current = true;
    setIsCheckingOut(true);
    try {
      if (posForm.id) {
        await checkoutEdit({
          uid: user.uid,
          isPro,
          posForm,
          ventas,
          movimientos,
          cuentas
        });

        setErrorMsg("Ticket actualizado correctamente ✅");
      } else {
        const { reciboId, totalFinal } = await checkoutCreate({
          uid: user.uid,
          carrito,
          ventas,
          posForm,
          cuentas
        });

        setCarrito([]);
        setErrorMsg(`Venta #${reciboId} exitosa por ${totalFinal.toLocaleString("es-EC", { style: "currency", currency: "USD" })} ✅`);

        // Cerrar una venta alimenta al pet
        recordPetEvent(user.uid, { type: "sale" }).catch(() => {});
        reportProductEvent("action_completed", { module: "business" });
      }

      setModalOpen(null);
      setPosForm?.({ cliente: "", cuentaId: "", id: null });
    } catch (e: any) {
      console.error("CHECKOUT ERROR:", e);
      setErrorMsg(userError(e), "error");
    } finally {
      checkoutLock.current = false;
      setIsCheckingOut(false);
    }
  };

  const addToCart = (producto: Producto): void => {
    if (!producto || producto.stock <= 0) {
      setErrorMsg("Producto sin existencias 📦", "error");
      return;
    }

    const itemEnCarrito = carrito.find((x) => x.id === producto.id);

    if (itemEnCarrito) {
      if (itemEnCarrito.cantidad >= producto.stock) {
        setErrorMsg("No hay más unidades disponibles", "error");
        return;
      }
      setCarrito(carrito.map((x) =>
        x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x
      ));
      return;
    }

    setCarrito([
      ...carrito,
      {
        ...producto,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta
      } as ItemCarrito
    ]);
  };

  const handleProductSave = async (productForm: Parameters<typeof saveProducto>[0]): Promise<void> => {
    if (!user || productLock.current) return;
    if (!navigator.onLine) { setErrorMsg("Sin conexión. Conservamos el formulario; vuelve a intentarlo cuando tengas internet.", "error"); return; }
    productLock.current = true;
    setIsSaving(true);
    const operation = productForm.productForm.id ? "edit" : "create";
    reportProductEvent("finance_action_started", { module: "productos", operation, plan: isPro ? "pro" : "free" });
    try {
      await saveProducto(productForm);
      setModalOpen(null);
      setErrorMsg("Guardado con exito ✅");
      reportProductEvent("action_completed", { module: "productos" });
      reportProductEvent("finance_action_completed", { module: "productos", operation, plan: isPro ? "pro" : "free" });
    } catch (error) {
      reportProductEvent("finance_action_failed", { module: "productos", operation, error_type: (error as { name?: string })?.name || "unknown" });
      setErrorMsg(userError(error), "error");
    } finally {
      productLock.current = false;
      setIsSaving(false);
    }
  };

  const cancelSaleItem = async (item: Venta): Promise<void> => {
    if (!user) return;
    if (!isPro) { setErrorMsg("Anular tickets es función PRO 💎", "error"); return; }
    try {
      const mov = movimientos.find((movement) => (movement as Movimiento & { ventaRefId?: string }).ventaRefId === item.id);
      await cancelSale(user.uid, item, mov?.id);
      setErrorMsg("Venta anulada 🗑️");
    } catch (error) {
      setErrorMsg(userError(error), "error");
    }
  };

  const deleteProduct = async (item: Producto): Promise<void> => {
    if (!user || !item?.id) return;
    if (!navigator.onLine) { setErrorMsg("Necesitas conexión para eliminar un registro.", "error"); return; }
    if (!window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    try {
      await financeService.deleteEntity(user.uid, "productos", item.id);
      setErrorMsg("Eliminado correctamente 🗑️");
    } catch (error) {
      setErrorMsg(userError(error), "error");
    }
  };

  return {
    isCheckingOut, isSavingProducts: isSaving, hasPendingCheckout, retryPendingCheckout,
    addToCart,
    handleCheckout, handleProductSave, cancelSaleItem, deleteProduct
  };
}
