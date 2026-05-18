import { useCallback, useEffect, useMemo } from 'react';
import { useMultiPets } from '@/app/hooks/useMultiPets';
import type { PetInstance, PetTipo } from '@/app/types/pet';

interface PetVisuals {
  emoji: string;
  bgColor: string;
  bordes: string;
  textColor: string;
}

type EstadoEmocional = 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico';

const MENSAJES: Record<EstadoEmocional, string[]> = {
  muerto: [
    'No tengo energia. Necesito actividad.',
    'Estoy fuera de combate.',
    'Necesito que vuelvas pronto.'
  ],
  triste: [
    'Te estuve esperando.',
    'Hoy me siento algo solo.',
    'Podemos mejorar esto juntos.'
  ],
  normal: [
    'Vamos bien, pero podemos subir de nivel.',
    'Estoy listo para entrenar.',
    'Un poco de actividad me vendria bien.'
  ],
  feliz: [
    'Buen trabajo, esto me anima.',
    'Me encanta este ritmo.',
    'Seguimos avanzando.'
  ],
  extatico: [
    'Nivel de energia al maximo.',
    'Estamos imparables.',
    'Excelente dia para seguir sumando puntos.'
  ]
};

const PET_VISUALS: Record<EstadoEmocional, PetVisuals> = {
  muerto: {
    emoji: 'X_X',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    bordes: 'border-gray-300 dark:border-gray-600',
    textColor: 'text-gray-500'
  },
  triste: {
    emoji: ':(',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    bordes: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-600'
  },
  normal: {
    emoji: ':|',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    bordes: 'border-yellow-200 dark:border-yellow-700',
    textColor: 'text-yellow-600'
  },
  feliz: {
    emoji: ':)',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    bordes: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-600'
  },
  extatico: {
    emoji: '^^',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    bordes: 'border-purple-200 dark:border-purple-700',
    textColor: 'text-purple-600'
  }
};

const DEFAULT_PET: PetInstance = {
  id: 'pet-main',
  tipo: 'gato',
  nombre: 'LifeOS',
  color: '#3b82f6',
  accesorios: [],
  raridad: 'comun',
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
  lastActivityAt: new Date().toISOString(),
  lastDecayAt: new Date().toISOString(),
  fechaAdopcion: new Date().toISOString()
};

function normalizeTipo(tipo?: string): PetTipo {
  if (tipo === 'alienigena') return 'alienigena';
  if (tipo === 'dragon') return 'dragon';
  if (tipo === 'perro') return 'perro';
  if (tipo === 'robot') return 'robot';
  return 'gato';
}

function getEstadoEmocional(pet: PetInstance | null): EstadoEmocional {
  if (!pet) return 'normal';
  const promedio = (pet.salud + pet.felicidad + pet.energia) / 3;

  if (promedio < 20) return 'muerto';
  if (promedio < 40) return 'triste';
  if (promedio < 70) return 'normal';
  if (promedio < 85) return 'feliz';
  return 'extatico';
}

export function useComunidadPet(userId?: string) {
  const {
    pets,
    petActivo,
    petActivoId,
    adoptarPet,
    cambiarPetActivo,
    actualizarPet,
    eliminarPet,
    petMasFuerte
  } = useMultiPets(userId);

  const estadoEmocional = getEstadoEmocional(petActivo);
  const petVisuals = PET_VISUALS[estadoEmocional];

  const mensaje = useMemo(() => {
    const arr = MENSAJES[estadoEmocional];
    if (arr.length === 0) return '';
    const seed = (petActivo?.experiencia || 0) + (petActivo?.nivel || 0);
    return arr[seed % arr.length];
  }, [estadoEmocional, petActivo?.experiencia, petActivo?.nivel]);

  useEffect(() => {
    const interval = setInterval(() => {
      actualizarPet((prevPet) => {
        const now = new Date();
        const lastDecay = new Date(prevPet.lastDecayAt);
        const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

        if (hoursSinceDecay < 6) return {};

        const noActivityToday =
          prevPet.actividadHoy.recetasCompartidas === 0 &&
          prevPet.actividadHoy.comentarios === 0 &&
          prevPet.actividadHoy.likes === 0 &&
          prevPet.actividadHoy.desafiosCompletados === 0;

        return {
          salud: Math.max(0, prevPet.salud - 8),
          felicidad: Math.max(0, prevPet.felicidad - 10),
          energia: Math.max(0, prevPet.energia - 5),
          diasSinActividad: noActivityToday ? prevPet.diasSinActividad + 1 : 0,
          lastDecayAt: now.toISOString()
        };
      });
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [actualizarPet, petActivoId]);

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 1) {
        actualizarPet(() => ({
          actividadHoy: {
            recetasCompartidas: 0,
            comentarios: 0,
            likes: 0,
            desafiosCompletados: 0,
            tiempoApp: 0
          }
        }));
      }
    }, 60 * 1000);

    return () => clearInterval(checkMidnight);
  }, [actualizarPet, petActivoId]);

  const registrarCompartirReceta = useCallback(() => {
    actualizarPet((prevPet) => {
      const experiencia = prevPet.experiencia + 25;
      const nivelSube = experiencia >= prevPet.nivel * 100;

      return {
        felicidad: Math.min(100, prevPet.felicidad + 15),
        energia: Math.min(100, prevPet.energia + 8),
        experiencia,
        nivel: nivelSube ? prevPet.nivel + 1 : prevPet.nivel,
        salud: nivelSube ? 100 : prevPet.salud,
        actividadHoy: {
          ...prevPet.actividadHoy,
          recetasCompartidas: prevPet.actividadHoy.recetasCompartidas + 1
        },
        lastActivityAt: new Date().toISOString()
      };
    });
  }, [actualizarPet]);

  const registrarComentario = useCallback(() => {
    actualizarPet((prevPet) => ({
      felicidad: Math.min(100, prevPet.felicidad + 8),
      energia: Math.min(100, prevPet.energia + 3),
      experiencia: prevPet.experiencia + 10,
      actividadHoy: {
        ...prevPet.actividadHoy,
        comentarios: prevPet.actividadHoy.comentarios + 1
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarLike = useCallback(() => {
    actualizarPet((prevPet) => ({
      felicidad: Math.min(100, prevPet.felicidad + 5),
      experiencia: prevPet.experiencia + 5,
      actividadHoy: {
        ...prevPet.actividadHoy,
        likes: prevPet.actividadHoy.likes + 1
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarDesafio = useCallback(() => {
    actualizarPet((prevPet) => ({
      salud: Math.min(100, prevPet.salud + 10),
      felicidad: Math.min(100, prevPet.felicidad + 12),
      energia: Math.min(100, prevPet.energia + 15),
      experiencia: prevPet.experiencia + 50,
      actividadHoy: {
        ...prevPet.actividadHoy,
        desafiosCompletados: prevPet.actividadHoy.desafiosCompletados + 1
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarTiempoApp = useCallback((minutos: number) => {
    actualizarPet((prevPet) => ({
      energia: Math.min(100, prevPet.energia + Math.floor(minutos / 5)),
      experiencia: prevPet.experiencia + Math.floor(minutos / 2),
      actividadHoy: {
        ...prevPet.actividadHoy,
        tiempoApp: prevPet.actividadHoy.tiempoApp + minutos
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarAgua = useCallback(() => {
    actualizarPet((prevPet) => ({
      energia: Math.min(100, prevPet.energia + 10),
      salud: Math.min(100, prevPet.salud + 5),
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarHabitoPet = useCallback(() => {
    actualizarPet((prevPet) => ({
      experiencia: prevPet.experiencia + 10,
      felicidad: Math.min(100, prevPet.felicidad + 3),
      lastActivityAt: new Date().toISOString()
    }));
  }, [actualizarPet]);

  const registrarComidaPet = useCallback((macrosOK: boolean, calorias: number = 0) => {
    actualizarPet((prevPet) => {
      const bonusEnergia = Math.floor(Math.max(0, calorias) / 200);

      return {
        felicidad: Math.min(100, prevPet.felicidad + (macrosOK ? 15 : 5)),
        experiencia: prevPet.experiencia + (macrosOK ? 20 : 5),
        energia: Math.min(100, prevPet.energia + bonusEnergia),
        lastActivityAt: new Date().toISOString()
      };
    });
  }, [actualizarPet]);

  const pet = useMemo(() => {
    if (!petActivo) return DEFAULT_PET;

    return {
      ...petActivo,
      tipo: normalizeTipo(petActivo.tipo),
      color: petActivo.color || '#3b82f6',
      accesorios: petActivo.accesorios || [],
      raridad: petActivo.raridad || 'comun'
    };
  }, [petActivo]);

  return {
    pet,
    petActivo: pet,
    pets,
    petActivoId,
    estadoEmocional,
    petVisuals,
    mensaje,
    petMasFuerte,
    adoptarPet,
    cambiarPetActivo,
    eliminarPet,
    registrarCompartirReceta,
    registrarComentario,
    registrarLike,
    registrarDesafio,
    registrarTiempoApp,
    registrarAgua,
    registrarHabitoPet,
    registrarComidaPet
  };
}
