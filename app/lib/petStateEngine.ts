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

function getTodayKey(iso = new Date().toISOString()) {
  return new Date(iso).toISOString().slice(0, 10);
}

function getEmptyDailyActivity() {
  return {
    agua: 0,
    comidas: 0,
    habitos: 0,
    recetasCompartidas: 0,
    comentarios: 0,
    likes: 0,
    desafiosCompletados: 0,
    tiempoApp: 0
  };
}

export function normalizePetForEngine(pet: PetInstance): PetInstance {
  return {
    ...pet,
    hambre: pet.hambre ?? 65,
    sed: pet.sed ?? 65,
    actividadHoy: {
      ...getEmptyDailyActivity(),
      ...(pet.actividadHoy || {})
    }
  };
}

export function getActividadTotalHoy(pet: PetInstance) {
  const normalized = normalizePetForEngine(pet);

  return (
    (normalized.actividadHoy.agua || 0) +
    (normalized.actividadHoy.comidas || 0) +
    (normalized.actividadHoy.habitos || 0) +
    (normalized.actividadHoy.recetasCompartidas || 0) +
    (normalized.actividadHoy.comentarios || 0) +
    (normalized.actividadHoy.likes || 0) +
    (normalized.actividadHoy.desafiosCompletados || 0) +
    (normalized.actividadHoy.tiempoApp || 0)
  );
}

export function getCuidadoBasicoHoy(pet: PetInstance) {
  const normalized = normalizePetForEngine(pet);

  return (
    (normalized.actividadHoy.agua || 0) +
    (normalized.actividadHoy.comidas || 0) +
    (normalized.actividadHoy.habitos || 0)
  );
}

export function syncDailyPetState(pet: PetInstance, nowISO = new Date().toISOString()) {
  const normalized = normalizePetForEngine(pet);
  const lastResetKey = getTodayKey(normalized.lastDailyResetAt || normalized.lastActivityAt || normalized.fechaAdopcion);
  const todayKey = getTodayKey(nowISO);

  if (lastResetKey === todayKey) return normalized;

  return {
    ...normalized,
    actividadHoy: getEmptyDailyActivity(),
    salud: clamp(normalized.salud - 8),
    felicidad: clamp(normalized.felicidad - 18),
    energia: clamp(normalized.energia - 20),
    hambre: clamp((normalized.hambre || 0) + 35),
    sed: clamp((normalized.sed || 0) + 35),
    diasSinActividad: normalized.diasSinActividad + 1,
    lastDailyResetAt: nowISO,
    lastDecayAt: nowISO
  };
}

export function deriveVisiblePetStats(pet: PetInstance): PetInstance {
  const normalized = normalizePetForEngine(pet);
  const aguaHoy = normalized.actividadHoy.agua || 0;
  const comidasHoy = normalized.actividadHoy.comidas || 0;
  const habitosHoy = normalized.actividadHoy.habitos || 0;
  const sinCuidadoBasico = aguaHoy === 0 && comidasHoy === 0 && habitosHoy === 0;

  const visible = { ...normalized };

  if (comidasHoy === 0) {
    visible.hambre = Math.max(visible.hambre || 0, 65);
    visible.felicidad = Math.min(visible.felicidad, 50);
  }

  if (aguaHoy === 0) {
    visible.sed = Math.max(visible.sed || 0, 65);
    visible.energia = Math.min(visible.energia, 45);
  }

  if (sinCuidadoBasico) {
    visible.salud = Math.min(visible.salud, 60);
    visible.felicidad = Math.min(visible.felicidad, 38);
    visible.energia = Math.min(visible.energia, 35);
  }

  return visible;
}

export function deriveEstadoEmocional(pet: PetInstance): EstadoEmocional {
  const normalized = normalizePetForEngine(pet);
  const promedio = (normalized.salud + normalized.felicidad + normalized.energia) / 3;
  const sinActividadReal = getActividadTotalHoy(normalized) === 0;
  const sinCuidadoBasico = getCuidadoBasicoHoy(normalized) === 0;
  let estado: EstadoEmocional = 'normal';

  if (promedio < 20) estado = 'muerto';
  else if (promedio < 40) estado = 'triste';
  else if (promedio < 70) estado = 'normal';
  else if (promedio < 85) estado = 'feliz';
  else estado = 'extatico';

  if (sinCuidadoBasico && ((normalized.hambre || 0) > 55 || (normalized.sed || 0) > 55)) {
    estado = 'triste';
  } else if (sinActividadReal) {
    if (normalized.diasSinActividad >= 1 || (normalized.hambre || 0) > 40 || (normalized.sed || 0) > 40) {
      estado = 'triste';
    } else if (estado === 'feliz' || estado === 'extatico') {
      estado = 'normal';
    }
  }

  return estado;
}

export function applyDecayTick(pet: PetInstance, nowISO = new Date().toISOString()) {
  const normalized = syncDailyPetState(pet, nowISO);
  const now = new Date(nowISO);
  const lastDecay = new Date(normalized.lastDecayAt);
  const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

  if (hoursSinceDecay < 6) return normalized;

  const noActivityToday = getActividadTotalHoy(normalized) === 0;
  return {
    ...normalized,
    salud: clamp(normalized.salud - 8),
    felicidad: clamp(normalized.felicidad - 10),
    energia: clamp(normalized.energia - 5),
    hambre: clamp((normalized.hambre || 0) + 15),
    sed: clamp((normalized.sed || 0) + 12),
    diasSinActividad: noActivityToday ? normalized.diasSinActividad + 1 : 0,
    lastDecayAt: nowISO
  };
}

export function applyPetEvent(pet: PetInstance, event: PetEvent, nowISO = new Date().toISOString()) {
  const base: PetInstance = {
    ...syncDailyPetState(pet, nowISO),
    diasSinActividad: 0,
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
      felicidad: clamp(base.felicidad + (sedActual > 60 ? 15 : 5)),
      actividadHoy: {
        ...base.actividadHoy,
        agua: base.actividadHoy.agua + 1
      }
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
      salud: clamp(base.salud + (macrosOK ? 8 : 2)),
      actividadHoy: {
        ...base.actividadHoy,
        comidas: base.actividadHoy.comidas + 1
      }
    };
  }

  if (event.type === 'habit') {
    const xp = addExperience(base, 10);
    return {
      ...base,
      ...xp,
      felicidad: clamp(base.felicidad + 3),
      actividadHoy: {
        ...base.actividadHoy,
        habitos: base.actividadHoy.habitos + 1
      }
    };
  }

  return base;
}
