// app/hooks/useFinanzas.ts
"use client";

import { useRef, useState } from "react";
import { userError } from "@/lib/userError";
import type { FirebaseUser } from "@/modules/auth/types/user";
import type { Cuenta, Movimiento } from "@/modules/finance/types";
import type { FinanceForm } from "@/modules/finance/types";
import type { Venta } from "@/modules/sales/types";
import { financeService } from "@/modules/finance/services/financeService";
import { financeSaveActions } from "@/modules/finance/use-cases/financeActionRegistry";
import { deleteMovimientoConReverso } from "@/modules/finance/use-cases/deleteMovimiento";
import { recordPetEvent } from "@/modules/pet/services/petService";
import { reportProductEvent } from "@/services/observability/reporter";
import { safeMonto } from "@/app/utils/helpers";

interface UseFinanzasContext {
  user: FirebaseUser | null;
  cuentas: Cuenta[];
  setModalOpen: (modal: any) => void;
  setErrorMsg: (msg: string, type?: "success" | "error" | "info") => void;
  updateStreakExternal: () => Promise<boolean>;
  movimientos: Movimiento[];
  ventas: Venta[];
}

export default function useFinanzas(ctx: UseFinanzasContext) {
  const {
    user, cuentas, setModalOpen, setErrorMsg, updateStreakExternal, movimientos, ventas
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
  ): Promise<void> => {
    if (!user || saving.current) return;
    if (!navigator.onLine) { setErrorMsg("Sin conexión. Conservamos el formulario; vuelve a intentarlo cuando tengas internet.", "error"); return; }
    saving.current = true;
    setIsSaving(true);
    const operation = financeForm.id ? "edit" : "create";
    reportProductEvent("finance_action_started", { module: col, operation, plan: isPro ? "pro" : "free" });
    try {
      const financeAction = financeSaveActions[col];
      if (!financeAction) {
        throw new Error(`Tipo de guardado no soportado: ${col}`);
      }

      await financeAction({
        uid: user.uid,
        isPro,
        cuentas,
        financeForm,
        updateStreakExternal
      });

      setModalOpen(null);
      setErrorMsg("Guardado con exito ✅");
      reportProductEvent("action_completed", { module: col === "movimientos" ? "finance" : col });
      reportProductEvent("finance_action_completed", { module: col, operation, plan: isPro ? "pro" : "free" });

      // Registrar movimientos alimenta al pet (disciplina financiera = cuidado)
      if (!financeForm.id && (col === "movimientos" || col === "transferencia" || col === "ahorroMeta")) {
        recordPetEvent(user.uid, { type: "finance_log" }).catch(() => {});
      }
    } catch (e: any) {
      reportProductEvent("finance_action_failed", { module: col, operation, error_type: e?.name || "unknown" });
      setErrorMsg(userError(e), "error");
    } finally { saving.current = false; setIsSaving(false); }
  };

  const deleteItem = async (col: string, item: any): Promise<void> => {
    if (!user || !item?.id) return;
    if (!navigator.onLine) { setErrorMsg("Necesitas conexión para eliminar un registro.", "error"); return; }
    const operation = col + "/" + item.id;
    if (deleting.current.has(operation)) return;
    if (!window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    deleting.current.add(operation);
    try {
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
  };
}
