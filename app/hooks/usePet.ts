import { useState, useEffect, useCallback, useRef } from 'react';
import { setDocument, subscribeDocument } from '@/services/firebase/firestoreService';
import { useUser } from '@/context/auth';
import type { PetInstance, PetTipo } from '@/app/types/pet';
import {
  applyDecayTick,
  createInitialPet,
  deriveEstadoEmocional,
  deriveVisiblePetStats,
  normalizePetForEngine,
  syncDailyPetState
} from '@/app/lib/petStateEngine';
import { userError } from '@/lib/userError';
import { getPetRef, changePet, seedPet } from '@/modules/pet/services/petService';

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
  // Un usuario autenticado solo puede recuperar su propia copia local.
  let pet: PetInstance | null;
  try { pet = parseStoredPet(localStorage.getItem(storageKey)); } catch { return null; }
  if (!pet) return null;

  // Migrar personalización del viejo usePetStore si el pet aún no tiene apariencia
  if (!pet.apariencia && storageKey === 'pet-main') {
    try {
      const rawCustom = localStorage.getItem('lifeos-pet-selected-v1');
      if (rawCustom) {
        const custom = JSON.parse(rawCustom);
        pet.apariencia = {
          tipo: custom?.tipo || 'gato',
          color: custom?.color || '#3b82f6',
          accesorios: custom?.accesorios || [],
          raridad: custom?.raridad || 'comun'
        };
        if (custom?.nombre) pet.nombre = String(custom.nombre).slice(0, 15);
      }
    } catch {
      // personalización corrupta: se ignora
    }
  }

  return pet;
}

export function usePet(userId?: string) {
  // Si no recibe userId, usa el usuario autenticado: así todos los
  // componentes comparten el mismo pet de Firestore sin prop-drilling.
  const { user } = useUser() as { user?: { uid?: string } };
  const uid: string | undefined = userId || user?.uid;
  const storageKey = `pet-${uid || 'main'}`;

  const [pet, setPet] = useState<PetInstance>(() => syncDailyPetState(createInitialPet()));
  const [petError, setPetError] = useState("");
  const petRef = useRef(pet);
  const mutationPending = useRef(false);
  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  // Fuente de verdad:
  // - Con userId: Firestore (users/{uid}/pet/main) vía onSnapshot.
  //   Funciona offline gracias al cache persistente y sincroniza solo.
  // - Sin userId: localStorage (modo anónimo/preview).
  useEffect(() => {
    if (!uid) {
      const local = readLocalPet(storageKey);
      if (local) {
        const timeoutId = setTimeout(() => setPet(local), 0);
        return () => clearTimeout(timeoutId);
      }
      return;
    }

    const ref = getPetRef(uid);
    let seeded = false;

    const unsub = subscribeDocument<PetInstance>(ref, (exists, data) => {
      if (exists && data) {
        setPet(syncDailyPetState(normalizePetForEngine({
          ...data,
          tipo: normalizarTipo(data.tipo)
        })));
        return;
      }

      // Primera vez: migrar el pet guardado en localStorage o sembrar uno nuevo
      if (!seeded) {
        seeded = true;
        const seed = readLocalPet(storageKey) || syncDailyPetState(createInitialPet());
        seedPet(uid, seed).catch((e) => setPetError(userError(e)));
      }
    }, (e) => setPetError(userError(e)));

    return unsub;
  }, [uid, storageKey]);

  // Persiste una mutación: Firestore si hay sesión, localStorage si no.
  const persist = useCallback(async (change: (current: PetInstance) => Partial<PetInstance>) => {
    if (mutationPending.current) return false;
    mutationPending.current = true;
    try {
      if (uid) await changePet(uid, change);
      else {
        const current = petRef.current;
        const next = { ...current, ...change(current) };
        localStorage.setItem(storageKey, JSON.stringify(next));
        petRef.current = next;
        setPet(next);
      }
      setPetError("");
      return true;
    } catch (e) { setPetError(userError(e)); return false; }
    finally { mutationPending.current = false; }
  }, [uid, storageKey]);

  const cambiarTipo = useCallback((nuevoTipo: PetTipo | string) => {
    const tipo = normalizarTipo(nuevoTipo);
    return persist(() => ({ tipo }));
  }, [persist]);

  const renombrar = useCallback((nuevoNombre: string) => {
    if (!nuevoNombre?.trim()) return;
    return persist(() => ({ nombre: nuevoNombre.trim().slice(0, 15) }));
  }, [persist]);

  const actualizarStats = useCallback((updates: Partial<PetInstance> | ((prevPet: PetInstance) => Partial<PetInstance> | PetInstance)) => {
    return persist((current) => {
      const resolved = typeof updates === 'function' ? updates(current) : updates;
      return { ...resolved, actividadHoy: { ...current.actividadHoy, ...(resolved.actividadHoy || {}) } };
    });
  }, [persist]);

  useEffect(() => {
    const interval = setInterval(() => {
      const prev = petRef.current;
      const next = applyDecayTick(prev);
      // Solo persistir si el tick realmente aplicó decay (evita escrituras vacías)
      if (next.lastDecayAt !== prev.lastDecayAt || next.lastDailyResetAt !== prev.lastDailyResetAt) {
        void persist((current) => applyDecayTick(current));
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [persist]);

  const petVisible = deriveVisiblePetStats(pet);
  const estadoEmocional = deriveEstadoEmocional(petVisible);

  return {
    pet: petVisible,
    petError,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    actualizarStats
  };
}
