import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PetInstance, PetRaridad, PetTipo } from '@/app/types/pet';

const PETS_STORAGE_PREFIX = 'pets-';
const PET_ACTIVE_STORAGE_PREFIX = 'pet-activo-';

const RARIDADES: PetRaridad[] = ['comun', 'raro', 'epico', 'legendario'];

function createBasePet(tipo: PetTipo, nombre: string, color?: string): PetInstance {
  const now = new Date().toISOString();

  return {
    id: `pet-${Date.now()}`,
    tipo,
    nombre: nombre.trim().slice(0, 15) || 'Mascota',
    color: color || '#3b82f6',
    accesorios: [],
    raridad: RARIDADES[Math.floor(Math.random() * RARIDADES.length)],
    nivel: 1,
    salud: 80,
    felicidad: 75,
    energia: 70,
    experiencia: 0,
    diasSinActividad: 0,
    actividadHoy: {
      recetasCompartidas: 0,
      comentarios: 0,
      likes: 0,
      desafiosCompletados: 0,
      tiempoApp: 0
    },
    lastActivityAt: now,
    lastDecayAt: now,
    fechaAdopcion: now
  };
}

function migrateLegacyPet(userId?: string): PetInstance[] {
  if (typeof window === 'undefined') return [];
  const legacyRaw = localStorage.getItem(`pet-${userId || 'main'}`);
  if (!legacyRaw) return [];

  try {
    const legacy = JSON.parse(legacyRaw);
    const base = createBasePet((legacy.tipo || 'gato') as PetTipo, legacy.nombre || 'LifeOS', legacy.color);

    return [
      {
        ...base,
        ...legacy,
        id: legacy.id || base.id,
        tipo: (legacy.tipo || 'gato') as PetTipo,
        raridad: (legacy.raridad || 'comun') as PetRaridad,
        accesorios: legacy.accesorios || []
      }
    ];
  } catch {
    return [];
  }
}

export function useMultiPets(userId?: string) {
  const petsStorageKey = `${PETS_STORAGE_PREFIX}${userId || 'main'}`;
  const activeStorageKey = `${PET_ACTIVE_STORAGE_PREFIX}${userId || 'main'}`;

  const [pets, setPets] = useState<PetInstance[]>([]);
  const [petActivoId, setPetActivoId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(petsStorageKey);
    const active = localStorage.getItem(activeStorageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PetInstance[];
        if (parsed.length > 0) {
          setPets(parsed);
          setPetActivoId(active || parsed[0].id);
          return;
        }
      } catch {
        // continue with migration/default
      }
    }

    const migrated = migrateLegacyPet(userId);
    if (migrated.length > 0) {
      setPets(migrated);
      setPetActivoId(migrated[0].id);
      return;
    }

    const starter = createBasePet('gato', 'LifeOS');
    setPets([starter]);
    setPetActivoId(starter.id);
  }, [activeStorageKey, petsStorageKey, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pets.length === 0) return;

    localStorage.setItem(petsStorageKey, JSON.stringify(pets));
    if (petActivoId) {
      localStorage.setItem(activeStorageKey, petActivoId);
    }
  }, [pets, petActivoId, petsStorageKey, activeStorageKey]);

  const petActivo = useMemo(
    () => pets.find((pet) => pet.id === petActivoId) || null,
    [pets, petActivoId]
  );

  const adoptarPet = useCallback((tipo: PetTipo, nombre: string, color?: string) => {
    const newPet = createBasePet(tipo, nombre, color);
    setPets((prev) => [...prev, newPet]);
    setPetActivoId(newPet.id);
    return newPet;
  }, []);

  const cambiarPetActivo = useCallback(
    (id: string) => {
      if (!pets.some((pet) => pet.id === id)) return;
      setPetActivoId(id);
    },
    [pets]
  );

  const actualizarPet = useCallback(
    (updates: Partial<PetInstance> | ((prevPet: PetInstance) => Partial<PetInstance>)) => {
      setPets((prev) =>
        prev.map((pet) => {
          if (pet.id !== petActivoId) return pet;
          const payload = typeof updates === 'function' ? updates(pet) : updates;
          return { ...pet, ...payload };
        })
      );
    },
    [petActivoId]
  );

  const eliminarPet = useCallback(
    (id: string) => {
      setPets((prev) => {
        const remaining = prev.filter((pet) => pet.id !== id);
        if (petActivoId === id) {
          setPetActivoId(remaining[0]?.id || null);
        }
        return remaining;
      });
    },
    [petActivoId]
  );

  const petMasFuerte = useMemo(() => {
    if (pets.length === 0) return null;

    return [...pets].sort(
      (a, b) => b.nivel * 100 + b.experiencia - (a.nivel * 100 + a.experiencia)
    )[0];
  }, [pets]);

  return {
    pets,
    petActivo,
    petActivoId,
    adoptarPet,
    cambiarPetActivo,
    actualizarPet,
    eliminarPet,
    petMasFuerte
  };
}