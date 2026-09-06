// app/hooks/useVentas.ts
"use client";

import { useRef, useState } from "react";
import { userError } from "@/lib/userError";
import { readPendingCheckout } from "@/services/api/pendingCheckout";
import { createSaleSecurely } from "@/services/api/backendService";
import type { FirebaseUser, Producto, ItemCarrito, Venta, Movimiento, Cuenta, PosForm } from "@/app/types";
import {
  validateCheckout,
  validateVentaSchema,
  checkoutEdit,
  checkoutCreate
} from "@/modules/sales/use-cases/checkout";
import { recordPetEvent } from "@/modules/pet/services/petService";

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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

  return {
    isCheckingOut, hasPendingCheckout, retryPendingCheckout,
    addToCart,
    handleCheckout
  };
}
