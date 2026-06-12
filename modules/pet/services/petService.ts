import { doc, getDoc, setDoc } from "firebase/firestore";
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
  return setDoc(getPetRef(uid), pet);
}

/**
 * Aplica un evento al pet leyendo el estado actual de Firestore.
 * Funciona offline: getDoc cae al cache local y setDoc queda en cola
 * hasta recuperar conexión. Permite que finanzas/ventas alimenten al pet
 * sin depender de que un componente con usePet esté montado.
 */
export async function recordPetEvent(uid: string, event: PetEvent): Promise<void> {
  const ref = getPetRef(uid);
  const snap = await getDoc(ref);
  const current = snap.exists()
    ? syncDailyPetState(normalizePetForEngine(snap.data() as PetInstance))
    : createInitialPet();

  const next = applyPetEvent(current, event);
  await setDoc(ref, next);
}
