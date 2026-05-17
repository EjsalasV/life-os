"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface PetState {
  id: string;
  nombre: string;
  nivel: number;
  salud: number; // 0-100
  felicidad: number; // 0-100
  energia: number; // 0-100
  estadoEmocional: 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico';
  ultimaActividad: Date;
  diasSinActividad: number;
  actividadHoy: {
    comentarios: number;
    likes: number;
    recetasCompartidas: number;
    desafiosCompletados: number;
    tiempoEnApp: number; // minutos
  };
  cumpleanos: Date;
  mensajeActual: string;
}

export default function useComunidadPet() {
  const [pet, setPet] = useState<PetState>({
    id: 'pet-' + Date.now(),
    nombre: '✨ Aura',
    nivel: 1,
    salud: 100,
    felicidad: 100,
    energia: 100,
    estadoEmocional: 'feliz',
    ultimaActividad: new Date(),
    diasSinActividad: 0,
    actividadHoy: {
      comentarios: 0,
      likes: 0,
      recetasCompartidas: 0,
      desafiosCompletados: 0,
      tiempoEnApp: 0
    },
    cumpleanos: new Date(),
    mensajeActual: '¡Hola! Cuéntame qué hiciste hoy'
  });

  // ===== REGISTRAR ACTIVIDADES =====

  const registrarCompartirReceta = useCallback(() => {
    setPet(prev => {
      const nuevoPet = { ...prev };
      nuevoPet.actividadHoy.recetasCompartidas += 1;
      nuevoPet.felicidad = Math.min(100, nuevoPet.felicidad + 15);
      nuevoPet.energia = Math.min(100, nuevoPet.energia + 10);
      nuevoPet.ultimaActividad = new Date();
      nuevoPet.diasSinActividad = 0;
      nuevoPet.mensajeActual = '¡Qué delicioso! 🍽️ Me encanta tu receta';

      if (nuevoPet.actividadHoy.recetasCompartidas % 5 === 0) {
        nuevoPet.nivel += 1;
        nuevoPet.mensajeActual = `🎉 ¡SUBÍ DE NIVEL ${nuevoPet.nivel}!`;
      }

      return nuevoPet;
    });
  }, []);

  const registrarComentario = useCallback(() => {
    setPet(prev => {
      const nuevoPet = { ...prev };
      nuevoPet.actividadHoy.comentarios += 1;
      nuevoPet.felicidad = Math.min(100, nuevoPet.felicidad + 8);
      nuevoPet.energia = Math.max(0, nuevoPet.energia - 2);
      nuevoPet.ultimaActividad = new Date();
      nuevoPet.diasSinActividad = 0;
      nuevoPet.mensajeActual = `Jejeje, comentario chisoso 😄`;
      return nuevoPet;
    });
  }, []);

  const registrarLike = useCallback(() => {
    setPet(prev => {
      const nuevoPet = { ...prev };
      nuevoPet.actividadHoy.likes += 1;
      nuevoPet.felicidad = Math.min(100, nuevoPet.felicidad + 5);
      nuevoPet.ultimaActividad = new Date();
      nuevoPet.diasSinActividad = 0;
      nuevoPet.mensajeActual = '❤️ Igual me gusta a mí';
      return nuevoPet;
    });
  }, []);

  const registrarDesafio = useCallback(() => {
    setPet(prev => {
      const nuevoPet = { ...prev };
      nuevoPet.actividadHoy.desafiosCompletados += 1;
      nuevoPet.salud = Math.min(100, nuevoPet.salud + 20);
      nuevoPet.felicidad = Math.min(100, nuevoPet.felicidad + 20);
      nuevoPet.energia = Math.max(0, nuevoPet.energia - 15);
      nuevoPet.ultimaActividad = new Date();
      nuevoPet.diasSinActividad = 0;
      nuevoPet.mensajeActual = `🏆 ¡LO HICISTE! Estoy tan orgulloso`;
      return nuevoPet;
    });
  }, []);

  const registrarTiempoApp = useCallback((minutos: number) => {
    setPet(prev => {
      const nuevoPet = { ...prev };
      nuevoPet.actividadHoy.tiempoEnApp += minutos;
      nuevoPet.energia = Math.max(0, nuevoPet.energia - minutos / 10);
      nuevoPet.ultimaActividad = new Date();
      nuevoPet.diasSinActividad = 0;

      // Si pasó demasiado tiempo, cansancio
      if (nuevoPet.actividadHoy.tiempoEnApp > 120) {
        nuevoPet.mensajeActual = '😴 Descansa un poco...';
        nuevoPet.energia = Math.min(50, nuevoPet.energia);
      } else {
        nuevoPet.mensajeActual = '¡Sigue así! 💪';
      }

      return nuevoPet;
    });
  }, []);

  // ===== EFECTOS DEL TIEMPO =====

  // Decaimiento natural cada 6 horas sin actividad
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const ahora = new Date();
        const tiempoSinActividad = (ahora.getTime() - prev.ultimaActividad.getTime()) / (1000 * 60 * 60); // horas

        if (tiempoSinActividad > 6) {
          const diasSin = Math.floor(tiempoSinActividad / 24);
          return {
            ...prev,
            diasSinActividad: diasSin,
            salud: Math.max(0, prev.salud - 5),
            felicidad: Math.max(0, prev.felicidad - 8),
            energia: Math.max(0, prev.energia - 3),
            mensajeActual: diasSin > 2 ? '😭 Me extrañas...' : '😢 ¿Dónde estás?'
          };
        }
        return prev;
      });
    }, 60000); // Revisar cada minuto

    return () => clearInterval(interval);
  }, []);

  // ===== CALCULAR ESTADO EMOCIONAL =====

  const estadoEmocional = useMemo(() => {
    const promedio = (pet.salud + pet.felicidad + pet.energia) / 3;

    if (promedio < 20) return 'muerto';
    if (promedio < 40) return 'triste';
    if (promedio < 70) return 'normal';
    if (promedio < 85) return 'feliz';
    return 'extatico';
  }, [pet.salud, pet.felicidad, pet.energia]);

  // ===== DATOS VISUALES DEL PET =====

  const petVisuals = useMemo(() => {
    const base = {
      muerto: {
        emoji: '💀',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        animacion: 'opacity-50',
        bordes: 'border-gray-300'
      },
      triste: {
        emoji: '😢',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        animacion: 'animate-pulse',
        bordes: 'border-blue-200'
      },
      normal: {
        emoji: '😐',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        animacion: '',
        bordes: 'border-yellow-200'
      },
      feliz: {
        emoji: '😊',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        animacion: 'animate-bounce',
        bordes: 'border-green-200'
      },
      extatico: {
        emoji: '🤩',
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        animacion: 'animate-pulse',
        bordes: 'border-purple-300'
      }
    };

    return base[pet.estadoEmocional as keyof typeof base] || base.normal;
  }, [pet.estadoEmocional]);

  // ===== MENSAJES CONTEXTUALES =====

  const obtenerMensaje = useCallback(() => {
    if (pet.diasSinActividad > 7) return '😭 No entiendes cuánto te extraño...';
    if (pet.diasSinActividad > 3) return '😢 ¿Por qué desapareciste?';
    if (pet.energia < 20) return '😴 Estoy muy cansado...';
    if (pet.salud < 20) return '🤒 No me siento bien...';
    if (pet.felicidad > 85) return '🌟 ¡Te extrañaba!';
    if (pet.actividadHoy.recetasCompartidas > 0) return '👨‍🍳 Tu receta se ve deliciosa';
    if (pet.actividadHoy.comentarios > 0) return '💬 Hablamos mucho hoy';

    return pet.mensajeActual;
  }, [pet]);

  // ===== RESET DIARIO =====

  const resetearActividadDiaria = useCallback(() => {
    setPet(prev => ({
      ...prev,
      actividadHoy: {
        comentarios: 0,
        likes: 0,
        recetasCompartidas: 0,
        desafiosCompletados: 0,
        tiempoEnApp: 0
      }
    }));
  }, []);

  return {
    // Estado del pet
    pet,
    estadoEmocional: pet.estadoEmocional,
    petVisuals,
    mensaje: obtenerMensaje(),

    // Registrar actividades
    registrarCompartirReceta,
    registrarComentario,
    registrarLike,
    registrarDesafio,
    registrarTiempoApp,

    // Utilidades
    resetearActividadDiaria,

    // Cálculos
    saludPromedio: Math.round((pet.salud + pet.felicidad + pet.energia) / 3),
    actividad: pet.actividadHoy,
    diasSinActividad: pet.diasSinActividad
  };
}
