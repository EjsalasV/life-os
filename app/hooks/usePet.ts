import { useState, useEffect, useCallback } from 'react';
import type { PetInstance, PetTipo } from '@/app/types/pet';
import { applyDecayTick, deriveEstadoEmocional } from '@/app/lib/petStateEngine';

const INITIAL_PET: PetInstance = {
  id: 'pet-main',
  tipo: 'gatoNaranja',
  nombre: 'LifeOS',
  color: '#fb923c',
  raridad: 'raro',
  nivel: 1,
  salud: 80,
  felicidad: 75,
  energia: 70,
  experiencia: 0,
  diasSinActividad: 0,
  hambre: 0,
  sed: 0,
  actividadHoy: {
    recetasCompartidas: 0,
    comentarios: 0,
    likes: 0,
    desafiosCompletados: 0,
    tiempoApp: 0
  },
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
    if (typeof window === 'undefined') return INITIAL_PET;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return { ...INITIAL_PET };

    try {
      const parsed = JSON.parse(stored);
      return {
        ...INITIAL_PET,
        ...parsed,
        tipo: normalizarTipo(parsed?.tipo),
        actividadHoy: {
          ...INITIAL_PET.actividadHoy,
          ...(parsed?.actividadHoy || {})
        }
      };
    } catch {
      return { ...INITIAL_PET };
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

  const estadoEmocional = deriveEstadoEmocional(pet);

  return {
    pet,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    actualizarStats
  };
}
