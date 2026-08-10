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
  const pet = parseStoredPet(localStorage.getItem(storageKey)) || parseStoredPet(localStorage.getItem('pet-main'));
  if (!pet) return null;

  // Migrar personalización del viejo usePetStore si el pet aún no tiene apariencia
  if (!pet.apariencia) {
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
  const petRef = useRef(pet);
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
      if (local) setPet(local);
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
        setDocument(ref, seed).catch((e) => console.error('Error sembrando pet:', e));
      }
    }, (e) => console.error('Error suscripción pet:', e));

    return unsub;
  }, [uid, storageKey]);

  // Persiste una mutación: Firestore si hay sesión, localStorage si no.
  const persist = useCallback((next: PetInstance) => {
    petRef.current = next;
    setPet(next);

    if (uid) {
      setDocument(getPetRef(uid), next).catch((e) => console.error('Error guardando pet:', e));
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  }, [uid, storageKey]);

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
