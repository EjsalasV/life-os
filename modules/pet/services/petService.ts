import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import {
  applyPetEvent,
  createInitialPet,
  normalizePetForEngine,
  syncDailyPetState,
  type PetEvent
} from "@/app/lib/petStateEngine";
import type { PetInstance } from "@/app/types/pet";

export const getPetRef = (uid: string) => doc(db, "users", uid, "pet", "main");

export function persistPet(uid: string, pet: PetInstance): Promise<void> {
  return changePet(uid, () => pet);
}

export async function seedPet(uid: string, seed: PetInstance): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = getPetRef(uid);
    if (!(await tx.get(ref)).exists()) tx.set(ref, seed);
  });
}

export async function changePet(uid: string, change: (current: PetInstance) => Partial<PetInstance>): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = getPetRef(uid);
    const snap = await tx.get(ref);
    const current = syncDailyPetState(normalizePetForEngine({ ...createInitialPet(), ...snap.data() } as PetInstance));
    tx.set(ref, { ...current, ...change(current) });
  });
}

/**
 * Aplica un evento al pet leyendo el estado actual de Firestore.
 * Funciona offline: getDoc cae al cache local y setDoc queda en cola
 * hasta recuperar conexión. Permite que finanzas/ventas alimenten al pet
 * sin depender de que un componente con usePet esté montado.
 */
export async function recordPetEvent(uid: string, event: PetEvent): Promise<void> {
  await changePet(uid, (current) => applyPetEvent(current, event));
}
