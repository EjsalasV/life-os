import { runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import { getSaludDiariaDoc } from "./refs";
import { createInitialSaludData, calculateBattery } from "@/app/lib/healthCalculations";
import type { SaludHoy } from "@/app/types";

export async function changeDailyHealth(uid: string, day: string, change: (current: SaludHoy & Record<string, any>) => Record<string, unknown>) {
  const ref = getSaludDiariaDoc(uid, day);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    const current = { ...createInitialSaludData(), ...snapshot.data(), fecha: day };
    if (!Array.isArray(current.alimentos) || !Array.isArray(current.habitosChecks)) throw new Error("El registro de salud necesita revisión antes de modificarlo.");
    const updates = change(current);
    const next = { ...current, ...updates };
    if (next.deficitCalorico) next.deficitCalorico = { ...next.deficitCalorico, balance: (next.caloriasTotales || 0) - (next.deficitCalorico.caloriasQuemadas || 0) };
    tx.set(ref, { ...next, bateria: calculateBattery(next), lastUpdate: serverTimestamp() }, { merge: true });
  });
}
