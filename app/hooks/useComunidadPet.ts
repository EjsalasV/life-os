import { useCallback, useMemo } from 'react';
import { usePet } from './usePet';

interface PetVisuals {
  emoji: string;
  bgColor: string;
  bordes: string;
  textColor: string;
}

type EstadoEmocional = 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico';

const MENSAJES: Record<EstadoEmocional, string[]> = {
  muerto: [
    'Necesito que vuelvas pronto.',
    'Estoy sin energia.',
    'Ayudame a recuperarme.'
  ],
  triste: [
    'Te estuve esperando.',
    'Hoy me siento algo solo.',
    'Podemos mejorar esto juntos.'
  ],
  normal: [
    'Vamos bien, sigamos sumando.',
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

export function useComunidadPet(userId?: string) {
  const { pet, estadoEmocional, actualizarStats, cambiarTipo, renombrar } = usePet(userId);

  const petVisuals = PET_VISUALS[estadoEmocional];

  const mensaje = useMemo(() => {
    const arr = MENSAJES[estadoEmocional];
    const seed = (pet.experiencia || 0) + (pet.nivel || 0);
    return arr[seed % arr.length];
  }, [estadoEmocional, pet.experiencia, pet.nivel]);

  const registrarCompartirReceta = useCallback(() => {
    const experiencia = pet.experiencia + 25;
    const subeNivel = experiencia >= pet.nivel * 100;

    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + 15),
      energia: Math.min(100, pet.energia + 8),
      experiencia,
      nivel: subeNivel ? pet.nivel + 1 : pet.nivel,
      salud: subeNivel ? 100 : pet.salud,
      actividadHoy: {
        ...pet.actividadHoy,
        recetasCompartidas: pet.actividadHoy.recetasCompartidas + 1
      },
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarComentario = useCallback(() => {
    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + 8),
      energia: Math.min(100, pet.energia + 3),
      experiencia: pet.experiencia + 10,
      actividadHoy: {
        ...pet.actividadHoy,
        comentarios: pet.actividadHoy.comentarios + 1
      },
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarLike = useCallback(() => {
    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + 5),
      experiencia: pet.experiencia + 5,
      actividadHoy: {
        ...pet.actividadHoy,
        likes: pet.actividadHoy.likes + 1
      },
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarDesafio = useCallback(() => {
    actualizarStats({
      salud: Math.min(100, pet.salud + 10),
      felicidad: Math.min(100, pet.felicidad + 12),
      energia: Math.min(100, pet.energia + 15),
      experiencia: pet.experiencia + 50,
      actividadHoy: {
        ...pet.actividadHoy,
        desafiosCompletados: pet.actividadHoy.desafiosCompletados + 1
      },
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarTiempoApp = useCallback((minutos: number) => {
    actualizarStats({
      energia: Math.min(100, pet.energia + Math.floor(minutos / 5)),
      experiencia: pet.experiencia + Math.floor(minutos / 2),
      actividadHoy: {
        ...pet.actividadHoy,
        tiempoApp: pet.actividadHoy.tiempoApp + minutos
      },
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarAgua = useCallback(() => {
    const sedReducida = Math.max(0, (pet.sed || 0) - 20);
    const felicidadExtra = (pet.sed || 0) > 60 ? 15 : 5;

    actualizarStats({
      energia: Math.min(100, pet.energia + 10),
      salud: Math.min(100, pet.salud + 5),
      sed: sedReducida,
      felicidad: Math.min(100, pet.felicidad + felicidadExtra),
      experiencia: pet.experiencia + 8,
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarComidaPet = useCallback((macrosOK: boolean, calorias = 0) => {
    const hambreActual = pet.hambre || 0;
    const hambreReducida = Math.max(0, hambreActual - 25);
    const felicidadBase = hambreActual > 60 ? 20 : (macrosOK ? 15 : 5);

    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + felicidadBase),
      experiencia: pet.experiencia + (macrosOK ? 20 : 5),
      energia: Math.min(100, pet.energia + Math.floor(Math.max(0, calorias) / 200)),
      hambre: hambreReducida,
      salud: Math.min(100, pet.salud + (macrosOK ? 8 : 2)),
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  const registrarHabitoPet = useCallback(() => {
    actualizarStats({
      experiencia: pet.experiencia + 10,
      felicidad: Math.min(100, pet.felicidad + 3),
      lastActivityAt: new Date().toISOString()
    });
  }, [pet, actualizarStats]);

  return {
    pet,
    estadoEmocional,
    petVisuals,
    mensaje,
    cambiarTipo,
    renombrar,
    registrarCompartirReceta,
    registrarComentario,
    registrarLike,
    registrarDesafio,
    registrarTiempoApp,
    registrarAgua,
    registrarComidaPet,
    registrarHabitoPet,
    actualizarStats
  };
}

