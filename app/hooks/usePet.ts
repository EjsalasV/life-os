import { useState, useEffect, useCallback } from 'react';
import type { PetInstance, PetTipo } from '@/app/types/pet';
import {
  applyDecayTick,
  deriveEstadoEmocional,
  deriveVisiblePetStats,
  syncDailyPetState
} from '@/app/lib/petStateEngine';

const INITIAL_PET: PetInstance = {
  id: 'pet-main',
  tipo: 'gatoNaranja',
  nombre: 'LifeOS',
  color: '#fb923c',
  raridad: 'raro',
  nivel: 1,
  salud: 55,
  felicidad: 35,
  energia: 30,
  experiencia: 0,
  diasSinActividad: 0,
  hambre: 70,
  sed: 70,
  actividadHoy: {
    agua: 0,
    comidas: 0,
    habitos: 0,
    recetasCompartidas: 0,
    comentarios: 0,
    likes: 0,
    desafiosCompletados: 0,
    tiempoApp: 0
  },
  lastDailyResetAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
  lastDecayAt: new Date().toISOString(),
  fechaAdopcion: new Date().toISOString()
};

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

export function usePet(userId?: string) {
  const storageKey = `pet-${userId || 'main'}`;

  const [pet, setPet] = useState<PetInstance>(() => {
    if (typeof window === 'undefined') return syncDailyPetState(INITIAL_PET);
    const stored = localStorage.getItem(storageKey);

    if (!stored) return syncDailyPetState({ ...INITIAL_PET });

    try {
      const parsed = JSON.parse(stored);
      return syncDailyPetState({
        ...INITIAL_PET,
        ...parsed,
        tipo: normalizarTipo(parsed?.tipo),
        actividadHoy: {
          ...INITIAL_PET.actividadHoy,
          ...(parsed?.actividadHoy || {})
        }
      });
    } catch {
      return syncDailyPetState({ ...INITIAL_PET });
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(pet));
  }, [pet, storageKey]);

  const cambiarTipo = useCallback((nuevoTipo: PetTipo | string) => {
    const tipo = normalizarTipo(nuevoTipo);
    setPet((prevPet) => ({
      ...prevPet,
      tipo,
      nombre: prevPet.nombre || 'LifeOS'
    }));
  }, []);

  const renombrar = useCallback((nuevoNombre: string) => {
    if (!nuevoNombre?.trim()) return;
    setPet((prevPet) => ({
      ...prevPet,
      nombre: nuevoNombre.trim().slice(0, 15)
    }));
  }, []);

  const actualizarStats = useCallback((updates: Partial<PetInstance> | ((prevPet: PetInstance) => Partial<PetInstance> | PetInstance)) => {
    setPet((prevPet) => {
      const resolved = typeof updates === 'function' ? updates(prevPet) : updates;
      return {
        ...prevPet,
        ...resolved,
        actividadHoy: {
          ...prevPet.actividadHoy,
          ...(resolved.actividadHoy || {})
        }
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prevPet) => applyDecayTick(prevPet));
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
