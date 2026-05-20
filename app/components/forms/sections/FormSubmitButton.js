import React from "react";

export default function FormSubmitButton({ modalType, productForm, onConfirm }) {
  const label =
    modalType === "cobrar"
      ? "Confirmar Pago y Cerrar"
      : modalType === "producto" && productForm.id
        ? "Actualizar Producto"
        : modalType === "producto"
          ? "Guardar en Inventario"
          : modalType === "movimiento"
            ? "Registrar Movimiento"
            : modalType === "presupuesto"
              ? "Crear Presupuesto"
              : modalType === "cuenta"
                ? "Crear Cuenta"
                : modalType === "meta"
                  ? "Crear Meta de Ahorro"
                  : modalType === "fijo"
                    ? "Crear Gasto Fijo"
                    : "Guardar";

  return (
    <button
      onClick={onConfirm}
      className="w-full bg-black text-white font-black py-5 rounded-[22px] shadow-xl active:scale-95 transition-all mt-4 uppercase text-[11px] tracking-widest"
    >
      {label}
    </button>
  );
}
