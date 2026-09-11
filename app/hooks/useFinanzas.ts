// app/hooks/useFinanzas.ts
"use client";

import { useRef, useState } from "react";
import { userError } from "@/lib/userError";
import type {
  FirebaseUser, Cuenta, Movimiento, Producto, FinanceForm,
  ProductForm, HealthForm, Venta
} from "@/app/types";
import { financeService } from "@/modules/finance/services/financeService";
import { cancelSale } from "@/modules/finance/use-cases/cancelSale";
import { deleteMovimientoConReverso } from "@/modules/finance/use-cases/deleteMovimiento";
import { recordPetEvent } from "@/modules/pet/services/petService";
import { reportProductEvent } from "@/services/observability/reporter";
import {
  saveProducto,
  saveMovimiento,
  saveCuenta,
  savePeso,
  saveFijo,
  saveMeta,
  savePresupuesto,
  saveHabito,
  saveTransferencia,
  saveAhorroMeta,
  saveTarjeta
} from "@/modules/finance/use-cases/financeSaveActions";
import { safeMonto } from "@/app/utils/helpers";
import { removeProfilePhoto, uploadProfilePhoto } from "@/services/firebase/profileService";

interface UseFinanzasContext {
  user: FirebaseUser | null;
  cuentas: Cuenta[];
  setModalOpen: (modal: any) => void;
  setFinanceForm: (form: any) => void;
  setProductForm: (form: any) => void;
  setHealthForm: (form: any) => void;
  setErrorMsg: (msg: string, type?: "success" | "error" | "info") => void;
  updateStreakExternal: () => Promise<boolean>;
  movimientos: Movimiento[];
  ventas: Venta[];
  productos: Producto[];
  setPosForm: (form: any) => void;
}

type SaveAction = (ctx: {
  uid: string;
  isPro: boolean;
  cuentas: Cuenta[];
  productosCount: number;
  financeForm: FinanceForm;
  productForm: ProductForm;
  healthForm: HealthForm;
  updateStreakExternal: () => Promise<boolean>;
}) => Promise<void>;

const saveActions: Record<string, SaveAction> = {
  productos: saveProducto,
  movimientos: saveMovimiento,
  cuentas: saveCuenta,
  peso: savePeso,
  fijos: saveFijo,
  metas: saveMeta,
  presupuestos: savePresupuesto,
  habitos: saveHabito,
  transferencia: saveTransferencia,
  ahorroMeta: saveAhorroMeta,
  tarjetas: saveTarjeta
};

export default function useFinanzas(ctx: UseFinanzasContext) {
  const {
    user, cuentas, setModalOpen, setErrorMsg, updateStreakExternal, movimientos, ventas, productos
  } = ctx;

  const isPro = user?.plan === "pro";
  const saving = useRef(false);
  const deleting = useRef(new Set<string>());
  const [isSaving, setIsSaving] = useState(false);

  const canDeleteCuenta = (cuentaId: string): string | null => {
    const cuenta = cuentas.find((item) => item.id === cuentaId);
    if (!cuenta) return "La cuenta ya no existe";

    if (safeMonto(cuenta.monto) !== 0) {
      return "No puedes eliminar una cuenta con saldo distinto de 0";
    }

    const hasReferences = movimientos.some((mov) => (
      mov?.cuentaId === cuentaId || mov?.cuentaDestinoId === cuentaId
    ));

    const hasSales = ventas.some((venta) => venta?.cuentaId === cuentaId);

    if (hasReferences || hasSales) {
      return "No puedes eliminar una cuenta con movimientos asociados";
    }

    return null;
  };

  const handleSave = async (
    col: string,
    financeForm: FinanceForm,
    productForm: ProductForm,
    healthForm: HealthForm
  ): Promise<void> => {
    if (!user || saving.current) return;
    if (!navigator.onLine) { setErrorMsg("Sin conexión. Conservamos el formulario; vuelve a intentarlo cuando tengas internet.", "error"); return; }
    saving.current = true;
    setIsSaving(true);
    try {
      const action = saveActions[col];
      if (!action) {
        throw new Error(`Tipo de guardado no soportado: ${col}`);
      }

      await action({
        uid: user.uid,
        isPro,
        cuentas,
        productosCount: productos.length,
        financeForm,
        productForm,
        healthForm,
        updateStreakExternal
      });

      setModalOpen(null);
      setErrorMsg("Guardado con exito ✅");
      reportProductEvent("action_completed", { module: col === "movimientos" ? "finance" : col });

      // Registrar movimientos alimenta al pet (disciplina financiera = cuidado)
      if (!financeForm.id && (col === "movimientos" || col === "transferencia" || col === "ahorroMeta")) {
        recordPetEvent(user.uid, { type: "finance_log" }).catch(() => {});
      }
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
    } finally { saving.current = false; setIsSaving(false); }
  };

  const handleTogglePlan = async (): Promise<void> => {
    if (!user) return;
    try {
      const nuevoPlan = user.plan === "pro" ? "free" : "pro";
      await financeService.updateUser(user.uid, { plan: nuevoPlan });
      setErrorMsg(`Plan cambiado a ${nuevoPlan.toUpperCase()} 🔄`);
    } catch (e: any) {
      setErrorMsg("Error al cambiar plan", "error");
    }
  };

  const handleUpdateName = async (nuevoNombre: string): Promise<void> => {
    const nombre = String(nuevoNombre || "").trim();
    if (!user || !nombre) throw new Error("Escribe un nombre para continuar.");
    if (nombre.length > 100) throw new Error("El nombre no puede superar 100 caracteres.");
    try {
      await financeService.updateUser(user.uid, { name: nombre });
      setErrorMsg("Nombre actualizado ✅");
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
      throw e;
    }
  };

  const handleUploadProfilePhoto = async (file: File): Promise<void> => {
    if (!user) return;
    try {
      await uploadProfilePhoto(user.uid, file, (user as any).photoPath);
      setErrorMsg("Foto de perfil actualizada ✅");
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
      throw e;
    }
  };

  const handleRemoveProfilePhoto = async (): Promise<void> => {
    if (!user) return;
    try {
      await removeProfilePhoto(user.uid, (user as any).photoPath);
      setErrorMsg("Foto de perfil eliminada ✅");
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
      throw e;
    }
  };

  const handleUpdateFocus = async (enfoque: string): Promise<void> => {
    if (!user || !enfoque) return;
    try {
      await financeService.updateUser(user.uid, { onboardingFocus: enfoque });
      setErrorMsg("Enfoque actualizado ✅");
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
    }
  };

  const deleteItem = async (col: string, item: any): Promise<void> => {
    if (!user || !item?.id) return;
    if (!navigator.onLine) { setErrorMsg("Necesitas conexión para eliminar un registro.", "error"); return; }
    const operation = col + "/" + item.id;
    if (deleting.current.has(operation)) return;
    if (col !== "ventas" && !window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    deleting.current.add(operation);
    try {
      if (col === "ventas") {
        if (!isPro) throw new Error("Anular tickets es función PRO 💎");

        const venta = item as Venta;
        const mov = movimientos.find((m) => (m as any).ventaRefId === item.id);
        await cancelSale(user.uid, venta, mov?.id);
        setErrorMsg("Venta anulada 🗑️");
        return;
      }

      if (col === "movimientos") {
        await deleteMovimientoConReverso(user.uid, item as Movimiento);
        setErrorMsg("Movimiento eliminado y saldo revertido 🗑️");
        return;
      }

      if (col === "cuentas") {
        const accountDeletionError = canDeleteCuenta(item.id);
        if (accountDeletionError) throw new Error(accountDeletionError);
      }

      await financeService.deleteEntity(user.uid, col, item.id);
      setErrorMsg("Eliminado correctamente 🗑️");
    } catch (e: any) {
      setErrorMsg(userError(e), "error");
    } finally { deleting.current.delete(operation); }
  };

  return {
    isSaving,
    handleSave,
    deleteItem,
    handleTogglePlan,
    handleUpdateName,
    handleUpdateFocus,
    handleUploadProfilePhoto,
    handleRemoveProfilePhoto
  };
}
