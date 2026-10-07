import React, { useMemo, useState } from 'react';
import { Activity, CalendarDays, Scale, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { getDailyExerciseMinutes, resolveCurrentWeight } from '@/app/lib/healthProfile';
import { getHabitPeriodStatus } from '@/modules/health/habitPeriod';

function dayKey(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const parsed = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function formatWeight(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} kg` : '—';
}

function metricAverage(items, key) {
  const values = items.map((item) => Number(item?.[key])).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function Trend({ values, color = 'bg-cyan-500', unit = '' }) {
  if (!values.length) return <p className="mt-3 text-xs text-slate-500">Aún no hay suficientes registros para mostrar tendencia.</p>;
  const max = Math.max(...values, 1);
  return <div className="mt-4 flex h-20 items-end gap-1" aria-label={`Tendencia con ${values.length} registros`}>{values.map((value, index) => <span key={`${value}-${index}`} title={`${value}${unit}`} className={`min-w-1 flex-1 rounded-t ${color}`} style={{ height: `${Math.max(8, (value / max) * 100)}%`, opacity: 0.35 + (index / values.length) * 0.65 }} />)}</div>;
}

export default function HealthProgressPanel({ saludHoy, historialSalud, historialPeso, habitos, physicalProfile }) {
  const [period, setPeriod] = useState(7);
  const history = useMemo(() => [saludHoy, ...(historialSalud || [])].filter(Boolean), [saludHoy, historialSalud]);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - period + 1);
  const days = history.filter((entry) => { const key = dayKey(entry.fecha); return key && new Date(`${key}T12:00:00`) >= start; }).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const weights = (historialPeso || []).filter((entry) => { const value = entry?.timestamp?.toDate?.() || new Date(entry?.timestamp); return Number.isFinite(entry?.peso) && !Number.isNaN(value.getTime()) && value >= start; }).sort((a, b) => { const left = a.timestamp?.toDate?.() || new Date(a.timestamp); const right = b.timestamp?.toDate?.() || new Date(b.timestamp); return left - right; });
  const latestWeight = resolveCurrentWeight(historialPeso, physicalProfile);
  const latestWeightEntry = weights[weights.length - 1] || null;
  const weightDate = latestWeightEntry?.timestamp?.toDate?.() || (latestWeightEntry?.timestamp ? new Date(latestWeightEntry.timestamp) : null);
  const previousWeight = weights.length > 1 ? weights[weights.length - 2].peso : null;
  const weightDelta = latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null;
  const periodWeightDelta = weights.length > 1 ? weights[weights.length - 1].peso - weights[0].peso : null;
  const averageSleep = metricAverage(days, 'suenoHoras');
  const averageStress = metricAverage(days, 'estres');
  const exerciseValues = days.map(getDailyExerciseMinutes).filter((value) => value > 0);
  const habitValues = days.map((day) => { const historyForDay = history.filter((item) => dayKey(item.fecha) <= dayKey(day.fecha)); return (habitos || []).filter((habit) => getHabitPeriodStatus(habit.id, habit.frecuencia || 'Diario', historyForDay, new Date(`${day.fecha}T12:00:00`)).completed).length; });
  const enoughDays = days.length >= 2;

  return <div className="space-y-5">
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900" aria-labelledby="health-progress-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300"><CalendarDays size={16} aria-hidden="true" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Progreso</span></div><h2 id="health-progress-title" className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Tu tendencia reciente</h2></div><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Periodo del progreso">{[7, 30].map((value) => <button type="button" key={value} onClick={() => setPeriod(value)} aria-pressed={period === value} className={`rounded-lg px-3 py-1.5 text-xs font-black ${period === value ? 'bg-white text-cyan-700 shadow-sm dark:bg-slate-700 dark:text-cyan-300' : 'text-slate-500'}`}>{value} días</button>)}</div></div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Mostramos solo registros reales de los últimos {period} días.</p>
      {!enoughDays && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Registra algunos días más para empezar a ver tendencias.</div>}
    </section>

    <div className="grid gap-3 sm:grid-cols-2">
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-slate-500">Peso</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{formatWeight(latestWeight)}</p><p className="text-xs text-slate-500">{weightDelta === null ? 'Registra otro peso para comparar' : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg desde el registro anterior`}</p></div><Scale className="text-violet-500" aria-hidden="true" /></div><Trend values={weights.map((entry) => Number(entry.peso))} color="bg-violet-500" unit=" kg" /><div className="mt-2 space-y-1 text-[10px] text-slate-400"><p>{weightDate && !Number.isNaN(weightDate.getTime()) ? `Último registro: ${weightDate.toLocaleDateString()}` : 'Sin fecha de registro'}</p><p>{periodWeightDelta === null ? `Aún no hay dos registros en ${period} días` : `${periodWeightDelta > 0 ? '+' : ''}${periodWeightDelta.toFixed(1)} kg en ${period} días`}</p><p>{Number.isFinite(physicalProfile?.pesoObjetivo) ? `Objetivo del perfil: ${formatWeight(physicalProfile.pesoObjetivo)}` : 'Puedes definir un objetivo en tu perfil.'}</p></div></section>
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-slate-500">Actividad</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{exerciseValues.length ? `${Math.round(exerciseValues.reduce((a, b) => a + b, 0) / exerciseValues.length)} min` : '—'}</p><p className="text-xs text-slate-500">promedio por día con registro</p></div><Activity className="text-emerald-500" aria-hidden="true" /></div><Trend values={exerciseValues} color="bg-emerald-500" unit=" min" /><p className="mt-2 text-[10px] text-slate-400">Las calorías de actividad son estimadas.</p></section>
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-slate-500">Sueño</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{averageSleep === null ? '—' : `${averageSleep.toFixed(1)} h`}</p><p className="text-xs text-slate-500">promedio registrado</p></div><Target className="text-indigo-500" aria-hidden="true" /></div><Trend values={days.map((day) => Number(day.suenoHoras)).filter(Number.isFinite)} color="bg-indigo-500" unit=" h" /></section>
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-slate-500">Estrés subjetivo</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{averageStress === null ? '—' : `${Math.round(averageStress)}/100`}</p><p className="text-xs text-slate-500">promedio reportado</p></div>{averageStress !== null && averageStress < 50 ? <TrendingDown className="text-emerald-500" aria-hidden="true" /> : <TrendingUp className="text-amber-500" aria-hidden="true" />}</div><Trend values={days.map((day) => Number(day.estres)).filter(Number.isFinite)} color="bg-amber-500" unit="/100" /></section>
    </div>

    <section className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-slate-500">Cumplimiento de hábitos</p><p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{habitsValuesLabel(habitValues, habitos)}</p></div><CheckIcon /></div><Trend values={habitValues} color="bg-cyan-500" unit=" hábitos" /></section>
  </div>;
}

function habitsValuesLabel(values, habits) {
  if (!values.length || !habits?.length) return 'Aún no hay suficientes registros';
  return `${Math.max(...values)} de ${habits.length} hábitos en un periodo`;
}

function CheckIcon() {
  return <span className="text-2xl" aria-hidden="true">✅</span>;
}
