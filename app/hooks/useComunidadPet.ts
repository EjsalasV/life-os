import { useState, useEffect, useCallback } from 'react';

interface PetState {
  id: string;
  nombre: string;
  nivel: number;
  salud: number;
  felicidad: number;
  energia: number;
  experiencia: number;
  diasSinActividad: number;
  actividadHoy: {
    recetasCompartidas: number;
    comentarios: number;
    likes: number;
    desafiosCompletados: number;
    tiempoApp: number;
  };
  lastActivityAt: string;
  lastDecayAt: string;
}

interface PetVisuals {
  emoji: string;
  bgColor: string;
  bordes: string;
  textColor: string;
}

interface Mensajes {
  muerto: string[];
  triste: string[];
  normal: string[];
  feliz: string[];
  extatico: string[];
}

const MENSAJES: Mensajes = {
  muerto: [
    '💀 He desaparecido... tuviste tu oportunidad',
    '👻 Solo quería que me visitaras...',
    '⚰️ Se acabó para mí'
  ],
  triste: [
    '😢 ¿Dónde estabas? Te extraño',
    '😭 No sé cuánto más pueda estar así',
    '😞 Me siento muy solo sin ti',
    '😔 ¿Ya no te importo?'
  ],
  normal: [
    '😐 Aquí ando, esperando',
    '😑 Podría ser mejor',
    '😕 Espero que me visites pronto',
    '😌 Estoy bien, pero podría mejorar'
  ],
  feliz: [
    '😊 ¡Qué bueno verte!',
    '😄 Me alegra que estés aquí',
    '🙂 ¡Esto me anima!',
    '😉 ¡Hola! ¿Cómo estás?'
  ],
  extatico: [
    '🤩 ¡ERES EL MEJOR!',
    '😍 ¡ESTOY TAN FELIZ!',
    '🥳 ¡CELEBREMOS JUNTOS!',
    '✨ ¡Eres increíble!',
    '🌟 ¡Me haces tan feliz!'
  ]
};

const PET_VISUALS: Record<string, PetVisuals> = {
  muerto: {
    emoji: '💀',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    bordes: 'border-gray-300 dark:border-gray-600',
    textColor: 'text-gray-500'
  },
  triste: {
    emoji: '😢',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    bordes: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-600'
  },
  normal: {
    emoji: '😐',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    bordes: 'border-yellow-200 dark:border-yellow-700',
    textColor: 'text-yellow-600'
  },
  feliz: {
    emoji: '😊',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    bordes: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-600'
  },
  extatico: {
    emoji: '🤩',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    bordes: 'border-purple-200 dark:border-purple-700',
    textColor: 'text-purple-600'
  }
};

const INITIAL_PET: PetState = {
  id: 'pet-main',
  nombre: 'LifeOS',
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
  lastDecayAt: new Date().toISOString()
};

export function useComunidadPet(userId?: string) {
  const [pet, setPet] = useState<PetState>(() => {
    if (typeof window === 'undefined') return INITIAL_PET;
    const stored = localStorage.getItem(`pet-${userId || 'main'}`);
    return stored ? JSON.parse(stored) : { ...INITIAL_PET };
  });

  // Calculate emotional state based on stats
  const promedio = (pet.salud + pet.felicidad + pet.energia) / 3;
  let estadoEmocional: 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico' = 'normal';

  if (promedio < 20) estadoEmocional = 'muerto';
  else if (promedio < 40) estadoEmocional = 'triste';
  else if (promedio < 70) estadoEmocional = 'normal';
  else if (promedio < 85) estadoEmocional = 'feliz';
  else estadoEmocional = 'extatico';

  const petVisuals = PET_VISUALS[estadoEmocional];
  const mensajeActual = MENSAJES[estadoEmocional][
    Math.floor(Math.random() * MENSAJES[estadoEmocional].length)
  ];

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pet-${userId || 'main'}`, JSON.stringify(pet));
    }
  }, [pet, userId]);

  // Decay stats every 6 hours
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prevPet => {
        const now = new Date();
        const lastDecay = new Date(prevPet.lastDecayAt);
        const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

        if (hoursSinceDecay >= 6) {
          const newDiasSinActividad = prevPet.actividadHoy.recetasCompartidas === 0 &&
                                       prevPet.actividadHoy.comentarios === 0 &&
                                       prevPet.actividadHoy.likes === 0 &&
                                       prevPet.actividadHoy.desafiosCompletados === 0
            ? prevPet.diasSinActividad + 1
            : 0;

          return {
            ...prevPet,
            salud: Math.max(0, prevPet.salud - 8),
            felicidad: Math.max(0, prevPet.felicidad - 10),
            energia: Math.max(0, prevPet.energia - 5),
            diasSinActividad: newDiasSinActividad,
            lastDecayAt: now.toISOString()
          };
        }
        return prevPet;
      });
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Reset daily activity at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 1) {
        setPet(prevPet => ({
          ...prevPet,
          actividadHoy: {
            recetasCompartidas: 0,
            comentarios: 0,
            likes: 0,
            desafiosCompletados: 0,
            tiempoApp: 0
          }
        }));
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkMidnight);
  }, []);

  const registrarCompartirReceta = useCallback(() => {
    setPet(prevPet => {
      const newPet = {
        ...prevPet,
        felicidad: Math.min(100, prevPet.felicidad + 15),
        energia: Math.min(100, prevPet.energia + 8),
        experiencia: prevPet.experiencia + 25,
        actividadHoy: {
          ...prevPet.actividadHoy,
          recetasCompartidas: prevPet.actividadHoy.recetasCompartidas + 1
        },
        lastActivityAt: new Date().toISOString()
      };

      // Check level up (every 100 exp)
      if (newPet.experiencia >= newPet.nivel * 100) {
        newPet.nivel += 1;
        newPet.salud = 100;
        newPet.felicidad = 100;
        newPet.energia = 100;
      }

      return newPet;
    });
  }, []);

  const registrarComentario = useCallback(() => {
    setPet(prevPet => ({
      ...prevPet,
      felicidad: Math.min(100, prevPet.felicidad + 8),
      energia: Math.min(100, prevPet.energia + 3),
      experiencia: prevPet.experiencia + 10,
      actividadHoy: {
        ...prevPet.actividadHoy,
        comentarios: prevPet.actividadHoy.comentarios + 1
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, []);

  const registrarLike = useCallback(() => {
    setPet(prevPet => ({
      ...prevPet,
      felicidad: Math.min(100, prevPet.felicidad + 5),
      experiencia: prevPet.experiencia + 5,
      actividadHoy: {
        ...prevPet.actividadHoy,
        likes: prevPet.actividadHoy.likes + 1
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, []);

  const registrarDesafio = useCallback(() => {
    setPet(prevPet => ({
      ...prevPet,
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
  }, []);

  const registrarTiempoApp = useCallback((minutos: number) => {
    setPet(prevPet => ({
      ...prevPet,
      energia: Math.min(100, prevPet.energia + Math.floor(minutos / 5)),
      experiencia: prevPet.experiencia + Math.floor(minutos / 2),
      actividadHoy: {
        ...prevPet.actividadHoy,
        tiempoApp: prevPet.actividadHoy.tiempoApp + minutos
      },
      lastActivityAt: new Date().toISOString()
    }));
  }, []);

  const registrarAgua = useCallback(() => {
    setPet(prevPet => ({
      ...prevPet,
      energia: Math.min(100, prevPet.energia + 10),
      salud: Math.min(100, prevPet.salud + 5),
      lastActivityAt: new Date().toISOString()
    }));
  }, []);

  return {
    pet,
    estadoEmocional,
    petVisuals,
    mensaje: mensajeActual,
    registrarCompartirReceta,
    registrarComentario,
    registrarLike,
    registrarDesafio,
    registrarTiempoApp,
    registrarAgua
  };
}
