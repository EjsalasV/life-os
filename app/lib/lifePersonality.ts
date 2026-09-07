export const LIFE_PERSONALITIES = {
  esencial: {
    label: "Esencial",
    description: "Calma, claridad y foco en lo importante.",
    mascotLabel: "Tu compañero está en calma.",
    streakLabel: "Tu progreso de la semana",
    recommendationLabel: "Tu siguiente movimiento",
  },
  equilibrado: {
    label: "Equilibrado",
    description: "Una experiencia profesional con personalidad.",
    mascotLabel: "Tu compañero avanza contigo.",
    streakLabel: "Tu impulso de 7 días",
    recommendationLabel: "Tu siguiente movimiento",
  },
  aventura: {
    label: "Aventura",
    description: "Más energía, misiones y recompensas.",
    mascotLabel: "Tu compañero está listo para la aventura.",
    streakLabel: "Tu misión de 7 días",
    recommendationLabel: "Tu siguiente misión",
  },
} as const;

export type LifePersonality = keyof typeof LIFE_PERSONALITIES;

export function isLifePersonality(value: string | null | undefined): value is LifePersonality {
  return Boolean(value && value in LIFE_PERSONALITIES);
}

export function getStoredPersonality(): LifePersonality {
  if (typeof window === "undefined") return "equilibrado";
  const stored = window.localStorage.getItem("lifeos-personality");
  return isLifePersonality(stored) ? stored : "equilibrado";
}
