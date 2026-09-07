import { getTime, safeMonto } from "@/app/utils/helpers";

function isToday(timestamp) {
  const value = typeof timestamp === "string"
    ? new Date(timestamp).getTime()
    : getTime(timestamp);
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

/**
 * Selects one useful next action instead of showing a dashboard full of equal
 * priority cards. The inputs are intentionally plain data so this can later
 * be replaced by a scored recommendation engine without touching the UI.
 */
export function getDailyRecommendation({ pet = {}, movimientos = [], ventas = [], enfoque = "equilibrio" } = {}) {
  if ((pet.sed || 0) > 60) {
    return {
      key: "hydration",
      label: "Dale agua a tu mascota",
      detail: "Un vaso mejora su energía y mantiene tu ritual activo.",
      icon: "💧",
      tab: "salud",
      modal: "agua"
    };
  }

  if ((pet.hambre || 0) > 60) {
    return {
      key: "meal",
      label: "Registra una comida",
      detail: "Alimenta tu progreso y ayuda a tu mascota a recuperarse.",
      icon: "🍽️",
      tab: "salud",
      modal: "nutricion"
    };
  }

  const hasTodaySale = ventas.some((sale) => isToday(sale.timestamp));
  const hasTodayFinance = movimientos.some((movement) => isToday(movement.timestamp));
  const shouldPrioritizeBusiness = enfoque === "negocio";
  const shouldPrioritizeFinance = enfoque === "finanzas";

  if (!hasTodaySale && ventas.length === 0 && (shouldPrioritizeBusiness || enfoque === "equilibrio")) {
    return {
      key: "first-sale",
      label: "Registra tu primera venta",
      detail: "Un registro convierte tu negocio en información útil para decidir.",
      icon: "🧾",
      tab: "ventas",
      modal: "cobrar"
    };
  }

  if (!hasTodayFinance && movimientos.length === 0 && (shouldPrioritizeFinance || enfoque === "equilibrio")) {
    return {
      key: "first-finance",
      label: "Registra tu primer movimiento",
      detail: "Con un ingreso o gasto puedes empezar a ver cómo se mueve tu dinero.",
      icon: "💰",
      tab: "finanzas",
      modal: "movimiento"
    };
  }

  if (enfoque === "negocio" && !hasTodaySale) {
    return {
      key: "business-check",
      label: "Revisa tu negocio de hoy",
      detail: "Mira tus ventas y productos para tomar una decisión concreta.",
      icon: "🧾",
      tab: "ventas",
      modal: null
    };
  }

  if (enfoque === "finanzas" && !hasTodayFinance) {
    return {
      key: "finance-check",
      label: "Revisa tus finanzas de hoy",
      detail: "Un minuto de revisión te ayuda a mantener el control.",
      icon: "💰",
      tab: "finanzas",
      modal: null
    };
  }

  const todaySpend = movimientos
    .filter((movement) => movement.tipo === "GASTO" && isToday(movement.timestamp))
    .reduce((sum, movement) => sum + safeMonto(movement.monto), 0);

  if (todaySpend > 0) {
    return {
      key: "review-spend",
      label: "Revisa tu gasto de hoy",
      detail: "Un vistazo rápido te ayuda a cerrar el día con intención.",
      icon: "🔎",
      tab: "finanzas",
      modal: null
    };
  }

  return {
    key: "health-check",
    label: "Completa una acción de salud",
    detail: "Un pequeño registro mantiene viva tu racha.",
    icon: "✨",
    tab: "salud",
    modal: "nutricion"
  };
}
