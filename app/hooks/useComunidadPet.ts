import { useCallback, useMemo } from 'react';
import { usePet } from './usePet';
import { applyPetEvent } from '@/app/lib/petStateEngine';

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
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'share_recipe' }));
  }, [actualizarStats]);

  const registrarComentario = useCallback(() => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'comment' }));
  }, [actualizarStats]);

  const registrarLike = useCallback(() => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'like' }));
  }, [actualizarStats]);

  const registrarDesafio = useCallback(() => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'challenge' }));
  }, [actualizarStats]);

  const registrarTiempoApp = useCallback((minutos: number) => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'app_time', minutes: minutos }));
  }, [actualizarStats]);

  const registrarAgua = useCallback(() => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'drink_water' }));
  }, [actualizarStats]);

  const registrarComidaPet = useCallback((macrosOK: boolean, calorias = 0) => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'eat_food', macrosOK, calorias }));
  }, [actualizarStats]);

  const registrarHabitoPet = useCallback(() => {
    actualizarStats((prevPet) => applyPetEvent(prevPet, { type: 'habit' }));
  }, [actualizarStats]);

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
