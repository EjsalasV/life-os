"use client";
import { useState, useEffect } from "react";
import { subscribeDocument, subscribeOrderedCollection } from "@/services/firebase/firestoreService";
import { changeDailyHealth } from "@/modules/health/services/dailyHealthService";
import { getSaludDiariaDoc, getSaludDiariaCol } from "@/services/firebase/refs";
import { getTodayKey } from "@/app/utils/helpers";
import { useLocalDay } from "./useLocalDay";
import { userError } from "@/lib/userError";
import { createInitialSaludData, analizarMacros, generarAlertasNutricionales, analizarCompatibilidad, predecirBateriaManana, generarConsejosIA } from "@/modules/health/domain/healthCalculations";
import type { FirebaseUser } from "@/app/types";
import type { SaludHoy, HistorialSalud, AlimentoRegistrado } from "@/modules/health/types/healthTypes";
import { reportProductEvent } from "@/services/observability/reporter";
import { foodSchema, healthStatSchema, mealQualitySchema, mealTypeSchema } from "@/modules/health/schemas/healthSchemas";
import { getHabitPeriodStatus, type HabitFrequency } from "@/modules/health/habitPeriod";
import { toggleFastingValue } from "@/modules/health/fasting";

export default function useHealthSystem(user: FirebaseUser | null, notify: (msg: string, type?: "success" | "error" | "info") => void) {
  const uid = user?.uid;
  const day = useLocalDay();
  const [saludHoy, setSaludHoy] = useState<SaludHoy | null>(null);
  const [historialSalud, setHistorialSalud] = useState<HistorialSalud[]>([]);
  const [healthError, setHealthError] = useState("");
  useEffect(() => {
    if (!uid) return;
    const fail = (error: Error) => setHealthError(userError(error));
    const daily = subscribeDocument<SaludHoy>(getSaludDiariaDoc(uid, day), (_exists, data) => {
      setSaludHoy({ ...createInitialSaludData(), ...data, fecha: day });
      setHealthError("");
    }, fail);
    const history = subscribeOrderedCollection<HistorialSalud>(getSaludDiariaCol(uid), "fecha", "desc", setHistorialSalud, fail);
    return () => { daily(); history(); };
  }, [uid, day]);

  const mutate = async (change: Parameters<typeof changeDailyHealth>[2]): Promise<boolean> => {
    if (!uid) return false;
    try {
      await changeDailyHealth(uid, getTodayKey(), change);
      return true;
    } catch (error) { notify(userError(error), "error"); return false; }
  };
  const foodUpdates = (current: SaludHoy, foods: AlimentoRegistrado[]) => {
    if (foods.some((food) => !foodSchema.safeParse(food).success)) throw new Error("Un alimento contiene datos inválidos. Revisa sus nutrientes.");
    const macros = analizarMacros(foods);
    return { ...macros, alertasNutricionales: generarAlertasNutricionales(macros), consejosIA: generarConsejosIA(current, macros, historialSalud) };
  };
  const registrarAlimento = async (food: AlimentoRegistrado) => {
    const saved = await mutate((current) => foodUpdates(current, current.alimentos.some((a: AlimentoRegistrado) => a.id === food.id) ? current.alimentos : [...current.alimentos, food]));
    if (saved) {
      notify("Alimento registrado ✅", "success");
      reportProductEvent("action_completed", { module: "health", action: "food" });
    }
    return saved;
  };
  const removeAlimento = (id: string) => mutate((current) => foodUpdates(current, current.alimentos.filter((a: AlimentoRegistrado) => a.id !== id)));
  const updateHealthStat = (field: keyof SaludHoy, value: unknown) => mutate(() => {
    if (!healthStatSchema.safeParse({ [field]: value }).success) throw new Error("Revisa el valor antes de guardarlo");
    return { [field]: value };
  });
  return {
    saludHoy, historialSalud, healthError, consejosIA: [], registrarAlimento, removeAlimento,
    analizarMacros, generarAlertasNutricionales, analizarCompatibilidad, predecirBateriaManana, updateHealthStat,
    addWater: async () => {
      const saved = await mutate((current) => ({ agua: Math.min(20, (current.agua || 0) + 1) }));
      if (saved) reportProductEvent("action_completed", { module: "health", action: "water" });
      return saved;
    },
    removeWater: () => mutate((current) => ({ agua: Math.max(0, (current.agua || 0) - 1) })),
    toggleComida: (tipo: string, calidad: string) => mutate((current) => {
      const validType = mealTypeSchema.safeParse(tipo);
      const validQuality = mealQualitySchema.safeParse(calidad);
      if (!validType.success || !validQuality.success) throw new Error("Revisa el tipo y la calidad de la comida");
      return { comidas: { ...current.comidas, [validType.data]: validQuality.data } };
    }),
    toggleHabitCheck: async (id: string, frequency: HabitFrequency = "Diario") => {
      const history = [saludHoy, ...historialSalud].filter(Boolean) as HistorialSalud[];
      const todayHasCheck = saludHoy?.habitosChecks?.includes(id) || false;
      const periodStatus = getHabitPeriodStatus(id, frequency, history);
      if (frequency !== "Diario" && periodStatus.completed && !todayHasCheck) return true;
      const saved = await mutate((current) => ({ habitosChecks: current.habitosChecks.includes(id) ? current.habitosChecks.filter((key: string) => key !== id) : [...current.habitosChecks, id] }));
      if (saved) reportProductEvent("action_completed", { module: "health", action: "habit" });
      return saved;
    },
    toggleFasting: () => mutate((current) => ({ ayunoInicio: toggleFastingValue(current.ayunoInicio) })),
    restoreFasting: (timestamp: number) => {
      if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > Date.now()) return Promise.resolve(false);
      return mutate(() => ({ ayunoInicio: timestamp }));
    },
    resetDailyHealth: () => mutate(() => ({ agua: 0, animo: "normal", comidas: {}, habitosChecks: [], ejercicioMinutos: 0 }))
  };
}
