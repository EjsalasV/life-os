export const ActividadesQuemadas = {
  reposo: { kcal_por_min: 1.0, icono: "😴" },
  "caminata-ligera": { kcal_por_min: 3.5, icono: "🚶" },
  "caminata-rápida": { kcal_por_min: 5.0, icono: "🏃" },
  "carrera-lenta": { kcal_por_min: 8.0, icono: "🏃‍♂️" },
  "carrera-rápida": { kcal_por_min: 12.0, icono: "⚡" },
  "ciclismo-ligero": { kcal_por_min: 6.0, icono: "🚴" },
  "ciclismo-intenso": { kcal_por_min: 12.0, icono: "🚴‍♀️" },
  "natación": { kcal_por_min: 8.0, icono: "🏊" },
  yoga: { kcal_por_min: 2.5, icono: "🧘" },
  "pesas-moderado": { kcal_por_min: 6.0, icono: "🏋️" },
  "pesas-intenso": { kcal_por_min: 10.0, icono: "💪" },
  hiit: { kcal_por_min: 12.0, icono: "🔥" },
  futbol: { kcal_por_min: 8.5, icono: "⚽" },
  tenis: { kcal_por_min: 9.0, icono: "🎾" }
} as const;

export function calcularCaloriasQuemadas(actividad: keyof typeof ActividadesQuemadas, minutos: number, peso: number): number {
  const tasaBase = ActividadesQuemadas[actividad].kcal_por_min;
  return Math.round(minutos * tasaBase * (peso / 70));
}
