"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { subscribeDocument, subscribeOrderedCollection } from "@/services/firebase/firestoreService";
import { changeDailyHealth } from "@/services/firebase/healthService";
import { getSaludDiariaDoc, getSaludDiariaCol } from "@/services/firebase/refs";
import { getTodayKey } from "@/app/utils/helpers";
import { useLocalDay } from "./useLocalDay";
import { userError } from "@/lib/userError";
import { createInitialSaludData, analizarMacros, generarAlertasNutricionales, analizarCompatibilidad, predecirBateriaManana, generarConsejosIA } from "@/app/lib/healthCalculations";
import type { FirebaseUser, SaludHoy, HistorialSalud, AlimentoRegistrado } from "@/app/types";

const nonnegative = z.number().finite().nonnegative();
const foodSchema = z.object({
  id: z.string().min(1), nombre: z.string().min(1), caloriasTotales: nonnegative,
  nutrientes: z.object({ proteina: nonnegative, carbohidratos: nonnegative, grasas: nonnegative,
    vitaminas: z.record(z.string(), nonnegative), minerales: z.record(z.string(), nonnegative)
  }).passthrough()
}).passthrough();

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
    if (saved) notify("Alimento registrado ✅", "success");
    return saved;
  };
  const removeAlimento = (id: string) => mutate((current) => foodUpdates(current, current.alimentos.filter((a: AlimentoRegistrado) => a.id !== id)));
  const updateHealthStat = (field: keyof SaludHoy, value: unknown) => mutate(() => {
    const schema = z.object({
      agua: z.number().int().min(0).max(20), animo: z.enum(["mal", "normal", "genial"]),
      ejercicioMinutos: z.number().finite().min(0).max(1440), suenoHoras: z.number().finite().min(0).max(24),
      calidadSueno: z.enum(["mala", "regular", "buena", "excelente"]), estres: z.number().min(0).max(100)
    }).partial().strict();
    if (!schema.safeParse({ [field]: value }).success) throw new Error("Revisa el valor antes de guardarlo");
    return { [field]: value };
  });
  return {
    saludHoy, historialSalud, healthError, consejosIA: [], registrarAlimento, removeAlimento,
    analizarMacros, generarAlertasNutricionales, analizarCompatibilidad, predecirBateriaManana, updateHealthStat,
    addWater: () => mutate((current) => ({ agua: Math.min(20, (current.agua || 0) + 1) })),
    removeWater: () => mutate((current) => ({ agua: Math.max(0, (current.agua || 0) - 1) })),
    toggleComida: (tipo: string, calidad: string) => mutate((current) => ({ comidas: { ...current.comidas, [tipo]: calidad } })),
    toggleHabitCheck: (id: string) => mutate((current) => ({ habitosChecks: current.habitosChecks.includes(id) ? current.habitosChecks.filter((key: string) => key !== id) : [...current.habitosChecks, id] })),
    toggleFasting: () => mutate((current) => ({ ayunoInicio: current.ayunoInicio ? null : Date.now() })),
    resetDailyHealth: () => mutate(() => ({ agua: 0, animo: "normal", comidas: {}, habitosChecks: [], ejercicioMinutos: 0 }))
  };
}
