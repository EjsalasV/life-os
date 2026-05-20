// Pet achievements and milestones
export const ACHIEVEMENTS = {
  FIRST_PET: { id: 'first-pet', emoji: '👶', title: 'Primer Encuentro', desc: 'Adopta tu mascota' },
  HEALTHY_EATER: { id: 'healthy-eater', emoji: '🥗', title: 'Comedor Sano', desc: 'Registra 10 comidas con macros OK' },
  HYDRATION_MASTER: { id: 'hydration-master', emoji: '💧', title: 'Maestro Hidratación', desc: 'Bebe 50 vasos de agua' },
  EXERCISE_ADDICT: { id: 'exercise-addict', emoji: '💪', title: 'Adicto al Ejercicio', desc: 'Ejercítate 300 minutos en una semana' },
  PERFECT_WEIGHT: { id: 'perfect-weight', emoji: '⚖️', title: 'Peso Perfecto', desc: 'Alcanza tu peso objetivo' },
  LEVEL_10: { id: 'level-10', emoji: '⭐', title: 'Legendario', desc: 'Sube a nivel 10' },
  CONSISTENCY: { id: 'consistency', emoji: '📅', title: 'Consistencia', desc: 'Interactúa 30 días seguidos' },
  ENERGY_MASTER: { id: 'energy-master', emoji: '⚡', title: 'Maestro de Energía', desc: 'Alcanza 100% energía 10 veces' },
  HAPPY_LIFE: { id: 'happy-life', emoji: '😄', title: 'Vida Feliz', desc: 'Mantén 90%+ felicidad 7 días' },
  EXTREME_HEALTH: { id: 'extreme-health', emoji: '❤️', title: 'Salud Extrema', desc: 'Alcanza 100% salud' }
};

export function checkAchievements(pet, userHealth, dailyStats) {
  const unlocked = [];

  // Logros basados en stats del pet
  if (pet.nivel >= 10) unlocked.push(ACHIEVEMENTS.LEVEL_10);
  if (pet.felicidad > 90 && pet.salud > 90) unlocked.push(ACHIEVEMENTS.HAPPY_LIFE);
  if (pet.salud === 100) unlocked.push(ACHIEVEMENTS.EXTREME_HEALTH);

  // Logros basados en actividad del usuario
  if (dailyStats?.comidaSanaCount >= 10) unlocked.push(ACHIEVEMENTS.HEALTHY_EATER);
  if (dailyStats?.agua >= 50) unlocked.push(ACHIEVEMENTS.HYDRATION_MASTER);
  if (dailyStats?.ejercicioMinutos >= 300) unlocked.push(ACHIEVEMENTS.EXERCISE_ADDICT);
  if (dailyStats?.diasConsecutivos >= 30) unlocked.push(ACHIEVEMENTS.CONSISTENCY);
  if (dailyStats?.energiaPerfecta >= 10) unlocked.push(ACHIEVEMENTS.ENERGY_MASTER);

  // Logro de peso
  if (userHealth?.peso === userHealth?.pesoObjetivo) {
    unlocked.push(ACHIEVEMENTS.PERFECT_WEIGHT);
  }

  return unlocked;
}

export function getNextMilestone(pet) {
  const milestones = [5, 10, 15, 20, 25, 30];
  const nextLevel = milestones.find(m => m > pet.nivel);
  if (!nextLevel) return null;

  const expNeeded = nextLevel * 100;
  const expProgress = (pet.experiencia / expNeeded) * 100;

  return {
    nivel: nextLevel,
    expProgress: Math.min(100, expProgress),
    expNeeded,
    expCurrent: pet.experiencia
  };
}
