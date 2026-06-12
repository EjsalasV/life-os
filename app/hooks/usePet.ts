import { useState, useEffect, useCallback, useRef } from 'react';
import { onSnapshot, setDoc } from 'firebase/firestore';
import type { PetInstance, PetTipo } from '@/app/types/pet';
import {
  applyDecayTick,
  createInitialPet,
  deriveEstadoEmocional,
  deriveVisiblePetStats,
  normalizePetForEngine,
  syncDailyPetState
} from '@/app/lib/petStateEngine';
import { getPetRef } from '@/modules/pet/services/petService';

function normalizarTipo(tipo?: string): PetTipo {
  if (tipo === 'gatoNaranja' || tipo === 'gatoCafe' || tipo === 'gato') return 'gatoNaranja';
  if (tipo === 'gatoGris') return 'gatoGris';
  if (tipo === 'gatoBlanco') return 'gatoBlanco';
  if (tipo === 'conejo' || tipo === 'rabbit' || tipo === 'bunny') return 'conejo';

  // Compatibilidad con tipos viejos
  if (tipo === 'perro' || tipo === 'dragon' || tipo === 'robot' || tipo === 'alienigena') {
    return 'gatoNaranja';
  }

  return 'gatoNaranja';
}

function parseStoredPet(raw: string | null): PetInstance | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return syncDailyPetState({
      ...createInitialPet(),
      ...parsed,
      tipo: normalizarTipo(parsed?.tipo),
      actividadHoy: {
        ...createInitialPet().actividadHoy,
        ...(parsed?.actividadHoy || {})
      }
    });
  } catch {
    return null;
  }
}

function readLocalPet(storageKey: string): PetInstance | null {
  if (typeof window === 'undefined') return null;
  // Clave actual y clave legacy (antes de tener userId)
  return parseStoredPet(localStorage.getItem(storageKey)) || parseStoredPet(localStorage.getItem('pet-main'));
}

export function usePet(userId?: string) {
  const storageKey = `pet-${userId || 'main'}`;

  const [pet, setPet] = useState<PetInstance>(() => syncDailyPetState(createInitialPet()));
  const petRef = useRef(pet);
  petRef.current = pet;

  // Fuente de verdad:
  // - Con userId: Firestore (users/{uid}/pet/main) vía onSnapshot.
  //   Funciona offline gracias al cache persistente y sincroniza solo.
  // - Sin userId: localStorage (modo anónimo/preview).
  useEffect(() => {
    if (!userId) {
      const local = readLocalPet(storageKey);
      if (local) setPet(local);
      return;
    }

    const ref = getPetRef(userId);
    let seeded = false;

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPet(syncDailyPetState(normalizePetForEngine({
          ...(snap.data() as PetInstance),
          tipo: normalizarTipo((snap.data() as PetInstance)?.tipo)
        })));
        return;
      }

      // Primera vez: migrar el pet guardado en localStorage o sembrar uno nuevo
      if (!seeded) {
        seeded = true;
        const seed = readLocalPet(storageKey) || syncDailyPetState(createInitialPet());
        setDoc(ref, seed).catch((e) => console.error('Error sembrando pet:', e));
      }
    }, (e) => console.error('Error suscripción pet:', e));

    return unsub;
  }, [userId, storageKey]);

  // Persiste una mutación: Firestore si hay sesión, localStorage si no.
  const persist = useCallback((next: PetInstance) => {
    petRef.current = next;
    setPet(next);

    if (userId) {
      setDoc(getPetRef(userId), next).catch((e) => console.error('Error guardando pet:', e));
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  }, [userId, storageKey]);

  const cambiarTipo = useCallback((nuevoTipo: PetTipo | string) => {
    const tipo = normalizarTipo(nuevoTipo);
    persist({
      ...petRef.current,
      tipo,
      nombre: petRef.current.nombre || 'LifeOS'
    });
  }, [persist]);

  const renombrar = useCallback((nuevoNombre: string) => {
    if (!nuevoNombre?.trim()) return;
    persist({
      ...petRef.current,
      nombre: nuevoNombre.trim().slice(0, 15)
    });
  }, [persist]);

  const actualizarStats = useCallback((updates: Partial<PetInstance> | ((prevPet: PetInstance) => Partial<PetInstance> | PetInstance)) => {
    const prevPet = petRef.current;
    const resolved = typeof updates === 'function' ? updates(prevPet) : updates;
    persist({
      ...prevPet,
      ...resolved,
      actividadHoy: {
        ...prevPet.actividadHoy,
        ...(resolved.actividadHoy || {})
      }
    });
  }, [persist]);

  useEffect(() => {
    const interval = setInterval(() => {
      const prev = petRef.current;
      const next = applyDecayTick(prev);
      // Solo persistir si el tick realmente aplicó decay (evita escrituras vacías)
      if (next.lastDecayAt !== prev.lastDecayAt || next.lastDailyResetAt !== prev.lastDailyResetAt) {
        persist(next);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [persist]);

  const petVisible = deriveVisiblePetStats(pet);
  const estadoEmocional = deriveEstadoEmocional(petVisible);

  return {
    pet: petVisible,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    actualizarStats
  };
}
