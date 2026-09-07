import { safeMonto } from "@/app/utils/helpers";

function toDate(value) {
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  if (value?.toDate) return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  return null;
}

function isThisWeek(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return date >= start && date <= now;
}

function isPreviousWeek(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - 7);
  return date >= previousStart && date < start;
}

export function getWeeklySummary({ movimientos = [], ventas = [], pet = {}, userStats = {} } = {}) {
  const weekMovements = movimientos.filter((item) => isThisWeek(item.timestamp));
  const weekSales = ventas.filter((item) => isThisWeek(item.timestamp));
  const previousActions = movimientos.filter((item) => isPreviousWeek(item.timestamp)).length
    + ventas.filter((item) => isPreviousWeek(item.timestamp)).length;
  const income = weekMovements
    .filter((item) => item.tipo === "INGRESO")
    .reduce((sum, item) => sum + safeMonto(item.monto), 0);
  const expenses = weekMovements
    .filter((item) => item.tipo === "GASTO")
    .reduce((sum, item) => sum + safeMonto(item.monto), 0);
  const salesIncome = weekSales.reduce((sum, item) => sum + safeMonto(item.total), 0);
  const petActions = Object.values(pet.actividadHoy || {})
    .reduce((sum, value) => sum + (Number(value) || 0), 0);
  const totalActions = weekMovements.length + weekSales.length + petActions;
  const actionDelta = totalActions - previousActions;
  const milestone = totalActions >= 10
    ? { label: "Semana en racha", goal: 10, progress: 100 }
    : totalActions >= 5
      ? { label: "Buen impulso", goal: 10, progress: totalActions * 10 }
      : { label: "Primer impulso", goal: 5, progress: totalActions * 20 };

  let insight = "Empieza con una acción pequeña y construye tu semana desde ahí.";
  if (totalActions >= 5) insight = "Tu semana ya tiene movimiento. Mantén el ritmo con una acción más.";
  else if (salesIncome > 0 && expenses > salesIncome) insight = "Tus gastos superan tus ventas esta semana; revisa un gasto antes de cerrar el día.";
  else if (salesIncome > 0) insight = "Tu negocio ya generó movimiento. Registra tus gastos para ver el resultado real.";
  else if (expenses > 0) insight = "Ya estás registrando gastos. Añade tus ingresos para entender el balance completo.";

  return {
    income,
    expenses,
    salesIncome,
    salesCount: weekSales.length,
    totalActions,
    previousActions,
    actionDelta,
    streak: userStats.currentStreak || 0,
    milestone,
    insight
  };
}
