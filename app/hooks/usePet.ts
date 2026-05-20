import { useState, useEffect, useCallback } from 'react';
import type { PetInstance, PetTipo } from '@/app/types/pet';

const INITIAL_PET: PetInstance = {
  id: 'pet-main',
  tipo: 'perro',
  nombre: 'LifeOS',
  color: '#3b82f6',
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
  if (tipo === 'gato') return 'gato';
  if (tipo === 'perro') return 'perro';
  if (tipo === 'dragon') return 'dragon';
  if (tipo === 'robot') return 'robot';
  if (tipo === 'alienigena') return 'alienigena';
  return 'perro';
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

  const actualizarStats = useCallback((updates: Partial<PetInstance>) => {
    setPet((prevPet) => ({
      ...prevPet,
      ...updates,
      actividadHoy: {
        ...prevPet.actividadHoy,
        ...(updates.actividadHoy || {})
      }
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prevPet) => {
        const now = new Date();
        const lastDecay = new Date(prevPet.lastDecayAt);
        const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

        if (hoursSinceDecay < 6) return prevPet;

        const noActivityToday =
          prevPet.actividadHoy.recetasCompartidas === 0 &&
          prevPet.actividadHoy.comentarios === 0 &&
          prevPet.actividadHoy.likes === 0 &&
          prevPet.actividadHoy.desafiosCompletados === 0;

        return {
          ...prevPet,
          salud: Math.max(0, prevPet.salud - 8),
          felicidad: Math.max(0, prevPet.felicidad - 10),
          energia: Math.max(0, prevPet.energia - 5),
          hambre: Math.min(100, (prevPet.hambre || 0) + 15),
          sed: Math.min(100, (prevPet.sed || 0) + 12),
          diasSinActividad: noActivityToday ? prevPet.diasSinActividad + 1 : 0,
          lastDecayAt: now.toISOString()
        };
      });
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const promedio = (pet.salud + pet.felicidad + pet.energia) / 3;
  let estadoEmocional: 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico' = 'normal';

  if (promedio < 20) estadoEmocional = 'muerto';
  else if (promedio < 40) estadoEmocional = 'triste';
  else if (promedio < 70) estadoEmocional = 'normal';
  else if (promedio < 85) estadoEmocional = 'feliz';
  else estadoEmocional = 'extatico';

  return {
    pet,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    actualizarStats
  };
}

