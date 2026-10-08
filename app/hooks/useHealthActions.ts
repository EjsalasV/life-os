"use client";

import { useRef, useState } from "react";
import { userError } from "@/lib/userError";
import { healthSaveActions } from "@/modules/health/use-cases/healthActionRegistry";
import { healthService } from "@/modules/health/services/healthService";
import type { HealthForm } from "@/modules/health/types/healthTypes";
import { reportProductEvent } from "@/services/observability/reporter";

type HealthModalForm = HealthForm & {
  foodName?: string;
  foodQuantity?: number;
  foodCalories?: number | string;
  tipoComida?: HealthForm["tipoComida"];
};

interface HealthActionContext {
  user: { uid: string; plan: "free" | "pro" } | null;
  setModalOpen: (modal: unknown) => void;
  setErrorMsg: (message: string, type?: "success" | "error" | "info") => void;
  healthSystem: {
    registrarAlimento: (food: Record<string, unknown>) => Promise<boolean>;
    addWater: () => Promise<boolean>;
  };
}

export default function useHealthActions({ user, setModalOpen, setErrorMsg, healthSystem }: HealthActionContext) {
  const saving = useRef(false);
  const deleting = useRef(new Set<string>());
  const [isSaving, setIsSaving] = useState(false);

  const handleHealthSave = async (collection: string, healthForm: HealthForm): Promise<void> => {
    if (!user || saving.current) return;
    if (!navigator.onLine) {
      setErrorMsg("Sin conexión. Conservamos el formulario; vuelve a intentarlo cuando tengas internet.", "error");
      return;
    }
    const action = healthSaveActions[collection];
    if (!action) throw new Error(`Tipo de guardado de Salud no soportado: ${collection}`);
    saving.current = true;
    setIsSaving(true);
    const operation = "create";
    reportProductEvent("finance_action_started", { module: collection, operation, plan: user.plan });
    try {
      await action({ uid: user.uid, isPro: user.plan === "pro", healthForm });
      setModalOpen(null);
      setErrorMsg("Guardado con exito ✅");
      reportProductEvent("action_completed", { module: collection });
      reportProductEvent("finance_action_completed", { module: collection, operation, plan: user.plan });
    } catch (error) {
      reportProductEvent("finance_action_failed", { module: collection, operation, error_type: (error as { name?: string })?.name || "unknown" });
      setErrorMsg(userError(error), "error");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const handleQuickMeal = async (healthForm: HealthModalForm): Promise<void> => {
    const nombre = String(healthForm.foodName || "").trim();
    if (!nombre) {
      setErrorMsg("Escribe qué comiste para registrarlo.", "error");
      return;
    }
    const cantidad = Math.max(1, Number(healthForm.foodQuantity) || 1);
    const calorias = Math.max(0, Number(healthForm.foodCalories) || 0);
    const saved = await healthSystem.registrarAlimento({
      id: `quick-${Date.now()}`,
      alimentoId: `quick-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      nombre,
      tipo: healthForm.tipoComida || "almuerzo",
      cantidad,
      unidad: "porción",
      hora: new Date().toISOString(),
      caloriasTotales: calorias * cantidad,
      nutrientes: { proteina: 0, carbohidratos: 0, grasas: 0, vitaminas: {}, minerales: {} },
      impactoBateria: 0
    });
    if (saved) setModalOpen(null);
  };

  const handleWater = async (): Promise<void> => {
    const saved = await healthSystem.addWater();
    if (saved) setModalOpen(null);
  };

  const archiveHabit = async (item: { id?: string }): Promise<void> => {
    if (!user || !item?.id) return;
    const operation = `habitos/${item.id}`;
    if (deleting.current.has(operation)) return;
    if (!navigator.onLine) {
      setErrorMsg("Necesitas conexión para eliminar un registro.", "error");
      return;
    }
    if (!window.confirm("¿Archivar este hábito? Dejará de aparecer en tu lista, pero conservarás su historial.")) return;
    deleting.current.add(operation);
    try {
      await healthService.archiveHabit(user.uid, item.id);
      setErrorMsg("Hábito archivado correctamente ✅");
      reportProductEvent("action_completed", { module: "health", action: "habit_archive" });
    } catch (error) {
      setErrorMsg(userError(error), "error");
    } finally {
      deleting.current.delete(operation);
    }
  };

  return { isSavingHealth: isSaving, handleHealthSave, handleQuickMeal, handleWater, archiveHabit };
}
