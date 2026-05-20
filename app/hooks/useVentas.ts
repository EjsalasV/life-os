// app/hooks/useVentas.ts
"use client";

import type { FirebaseUser, Producto, ItemCarrito, Venta, Movimiento, Cuenta, PosForm } from "@/app/types";
import {
  validateCheckout,
  validateVentaSchema,
  checkoutEdit,
  checkoutCreate
} from "@/modules/sales/use-cases/checkout";

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
    user, carrito, setCarrito, ventas, cuentas,
    posForm, setPosForm, setModalOpen, setErrorMsg, movimientos
  } = ctx;

  const isPro = user?.plan === "pro";

  const handleCheckout = async (): Promise<void> => {
    if (!user) return;

    const validationError = validateCheckout({
      isPro,
      posForm,
      ventas,
      carrito
    });

    if (validationError) {
      setErrorMsg(validationError, "error");
      return;
    }

    validateVentaSchema(posForm, carrito);
    setModalOpen(null);

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
      }

      setPosForm?.({ cliente: "", cuentaId: "", id: null });
    } catch (e: any) {
      console.error("CHECKOUT ERROR:", e);
      setErrorMsg("No se pudo completar la operación: " + e.message, "error");
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

  const handleGenerarPedido = () => {
    console.log("Generar pedido not implemented");
  };

  return {
    addToCart,
    handleCheckout,
    handleGenerarPedido
  };
}
