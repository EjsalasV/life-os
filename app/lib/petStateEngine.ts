import type { PetInstance } from '@/app/types/pet';

export type EstadoEmocional = 'muerto' | 'triste' | 'normal' | 'feliz' | 'extatico';

type PetEvent =
  | { type: 'share_recipe' }
  | { type: 'comment' }
  | { type: 'like' }
  | { type: 'challenge' }
  | { type: 'app_time'; minutes: number }
  | { type: 'drink_water' }
  | { type: 'eat_food'; macrosOK: boolean; calorias?: number }
  | { type: 'habit' };

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function addExperience(pet: PetInstance, delta: number) {
  const expTotal = Math.max(0, pet.experiencia + delta);
  let nextLevel = Math.max(1, pet.nivel);

  while (expTotal >= nextLevel * 100) {
    nextLevel += 1;
  }

  return {
    experiencia: expTotal,
    nivel: nextLevel
  };
}

export function getActividadTotalHoy(pet: PetInstance) {
  return (
    (pet.actividadHoy?.recetasCompartidas || 0) +
    (pet.actividadHoy?.comentarios || 0) +
    (pet.actividadHoy?.likes || 0) +
    (pet.actividadHoy?.desafiosCompletados || 0) +
    (pet.actividadHoy?.tiempoApp || 0)
  );
}

export function deriveEstadoEmocional(pet: PetInstance): EstadoEmocional {
  const promedio = (pet.salud + pet.felicidad + pet.energia) / 3;
  const sinActividadReal = getActividadTotalHoy(pet) === 0;
  let estado: EstadoEmocional = 'normal';

  if (promedio < 20) estado = 'muerto';
  else if (promedio < 40) estado = 'triste';
  else if (promedio < 70) estado = 'normal';
  else if (promedio < 85) estado = 'feliz';
  else estado = 'extatico';

  if (sinActividadReal) {
    if (pet.diasSinActividad >= 1 || (pet.hambre || 0) > 40 || (pet.sed || 0) > 40) {
      estado = 'triste';
    } else if (estado === 'feliz' || estado === 'extatico') {
      estado = 'normal';
    }
  }

  return estado;
}

export function applyDecayTick(pet: PetInstance, nowISO = new Date().toISOString()) {
  const now = new Date(nowISO);
  const lastDecay = new Date(pet.lastDecayAt);
  const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

  if (hoursSinceDecay < 6) return pet;

  const noActivityToday = getActividadTotalHoy(pet) === 0;
  return {
    ...pet,
    salud: clamp(pet.salud - 8),
    felicidad: clamp(pet.felicidad - 10),
    energia: clamp(pet.energia - 5),
    hambre: clamp((pet.hambre || 0) + 15),
    sed: clamp((pet.sed || 0) + 12),
    diasSinActividad: noActivityToday ? pet.diasSinActividad + 1 : 0,
    lastDecayAt: nowISO
  };
}

export function applyPetEvent(pet: PetInstance, event: PetEvent, nowISO = new Date().toISOString()) {
  const base: PetInstance = {
    ...pet,
    lastActivityAt: nowISO
  };

  if (event.type === 'share_recipe') {
    const xp = addExperience(base, 25);
    return {
      ...base,
      ...xp,
      felicidad: clamp(base.felicidad + 15),
      energia: clamp(base.energia + 8),
      salud: xp.nivel > base.nivel ? 100 : base.salud,
      actividadHoy: {
        ...base.actividadHoy,
        recetasCompartidas: base.actividadHoy.recetasCompartidas + 1
      }
    };
  }

  if (event.type === 'comment') {
    const xp = addExperience(base, 10);
    return {
      ...base,
      ...xp,
      felicidad: clamp(base.felicidad + 8),
      energia: clamp(base.energia + 3),
      actividadHoy: {
        ...base.actividadHoy,
        comentarios: base.actividadHoy.comentarios + 1
      }
    };
  }

  if (event.type === 'like') {
    const xp = addExperience(base, 5);
    return {
      ...base,
      ...xp,
      felicidad: clamp(base.felicidad + 5),
      actividadHoy: {
        ...base.actividadHoy,
        likes: base.actividadHoy.likes + 1
      }
    };
  }

  if (event.type === 'challenge') {
    const xp = addExperience(base, 50);
    return {
      ...base,
      ...xp,
      salud: clamp(base.salud + 10),
      felicidad: clamp(base.felicidad + 12),
      energia: clamp(base.energia + 15),
      actividadHoy: {
        ...base.actividadHoy,
        desafiosCompletados: base.actividadHoy.desafiosCompletados + 1
      }
    };
  }

  if (event.type === 'app_time') {
    const minutes = Math.max(0, event.minutes || 0);
    const xp = addExperience(base, Math.floor(minutes / 2));
    return {
      ...base,
      ...xp,
      energia: clamp(base.energia + Math.floor(minutes / 5)),
      actividadHoy: {
        ...base.actividadHoy,
        tiempoApp: base.actividadHoy.tiempoApp + minutes
      }
    };
  }

  if (event.type === 'drink_water') {
    const sedActual = base.sed || 0;
    const xp = addExperience(base, 8);
    return {
      ...base,
      ...xp,
      energia: clamp(base.energia + 10),
      salud: clamp(base.salud + 5),
      sed: clamp(sedActual - 20),
      felicidad: clamp(base.felicidad + (sedActual > 60 ? 15 : 5))
    };
  }

  if (event.type === 'eat_food') {
    const hambreActual = base.hambre || 0;
    const macrosOK = !!event.macrosOK;
    const calorias = Math.max(0, event.calorias || 0);
    const xp = addExperience(base, macrosOK ? 20 : 5);
    const felicidadBase = hambreActual > 60 ? 20 : macrosOK ? 15 : 5;

    return {
      ...base,
      ...xp,
      hambre: clamp(hambreActual - 25),
      felicidad: clamp(base.felicidad + felicidadBase),
      energia: clamp(base.energia + Math.floor(calorias / 200)),
      salud: clamp(base.salud + (macrosOK ? 8 : 2))
    };
  }

  if (event.type === 'habit') {
    const xp = addExperience(base, 10);
    return {
      ...base,
      ...xp,
      felicidad: clamp(base.felicidad + 3)
    };
  }

  return base;
}
