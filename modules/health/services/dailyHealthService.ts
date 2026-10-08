import { runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { getSaludDiariaDoc } from "@/services/firebase/refs";
import { createInitialSaludData, calculateBattery } from "@/modules/health/domain/healthCalculations";
import type { SaludHoy } from "@/modules/health/types/healthTypes";

export async function changeDailyHealth(uid: string, day: string, change: (current: SaludHoy & Record<string, any>) => Record<string, unknown>) {
  const ref = getSaludDiariaDoc(uid, day);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = { ...createInitialSaludData(), ...snapshot.data(), fecha: day };
    if (!Array.isArray(current.alimentos) || !Array.isArray(current.habitosChecks)) throw new Error("El registro de salud necesita revisión antes de modificarlo.");
    const next = { ...current, ...change(current) };
    const activities = next.deficitCalorico?.actividades;
    if (Array.isArray(activities)) next.ejercicioMinutos = activities.reduce((sum, activity) => sum + (Number(activity?.minutos) || 0), 0);
    if (next.deficitCalorico) next.deficitCalorico = { ...next.deficitCalorico, balance: (next.caloriasTotales || 0) - (next.deficitCalorico.caloriasQuemadas || 0) };
    transaction.set(ref, { ...next, bateria: calculateBattery(next), lastUpdate: serverTimestamp() }, { merge: true });
  });
}
