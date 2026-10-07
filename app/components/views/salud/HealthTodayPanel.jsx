import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Droplets, Moon, Smile, Sparkles, Zap } from 'lucide-react';
import { getDailyExerciseMinutes } from '@/app/lib/healthProfile';
import { getHabitPeriodStatus } from '@/modules/health/habitPeriod';

const sleepQualities = ['mala', 'regular', 'buena', 'excelente'];
const moods = [
  { value: 'mal', label: 'Mal', emoji: '😕' },
  { value: 'normal', label: 'Normal', emoji: '🙂' },
  { value: 'genial', label: 'Genial', emoji: '😊' }
];

function frequencyLabel(frequency) {
  return frequency === 'Semanal' ? 'Esta semana' : frequency === 'Mensual' ? 'Este mes' : 'Hoy';
}

function SummaryMetric({ icon: Icon, label, value, detail, tone = 'blue' }) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
  };
  return (
    <div className={`rounded-2xl p-3 ${tones[tone]}`}>
      <Icon size={16} aria-hidden="true" />
      <p className="mt-2 text-xl font-black leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide opacity-75">{label}</p>
      {detail && <p className="mt-1 text-[10px] font-semibold opacity-75">{detail}</p>}
    </div>
  );
}

export default function HealthTodayPanel({
  saludHoy,
  habitos,
  historialSalud,
  updateHealthStat,
  addWater,
  removeWater,
  toggleHabitCheck,
  registrarHabitoPet,
  onOpenSection
}) {
  const history = [saludHoy, ...(historialSalud || [])].filter(Boolean);
  const [sleep, setSleep] = useState(String(saludHoy?.suenoHoras || ''));
  const exercise = getDailyExerciseMinutes(saludHoy);
  const latestActivity = saludHoy?.deficitCalorico?.actividades?.slice(-1)[0];
  const activeHabits = useMemo(() => (habitos || []).filter((habit) => habit?.activo !== false), [habitos]);
  const habitsDone = activeHabits.filter((habit) => getHabitPeriodStatus(habit.id, habit.frecuencia || 'Diario', history).completed).length;
  const mood = moods.find((item) => item.value === saludHoy?.animo) || moods[1];

  const saveSleep = () => {
    const value = Number(sleep);
    if (Number.isFinite(value)) updateHealthStat('suenoHoras', value);
  };

  const toggleHabit = async (habit) => {
    const wasCompleted = getHabitPeriodStatus(habit.id, habit.frecuencia || 'Diario', history).completed;
    if (await toggleHabitCheck(habit.id, habit.frecuencia || 'Diario') && !wasCompleted) await registrarHabitoPet();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900" aria-labelledby="health-today-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
              <Sparkles size={16} aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hoy</span>
            </div>
            <h2 id="health-today-title" className="mt-2 text-2xl font-black text-slate-900 dark:text-white">¿Cómo vas hoy?</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Registra una acción pequeña y sigue tu ritmo.</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-center text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <Zap size={16} className="mx-auto" aria-hidden="true" />
            <strong className="mt-1 block text-lg leading-none">{saludHoy?.bateria ?? 0}%</strong>
            <span className="text-[9px] font-black uppercase">energía estimada</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryMetric icon={Droplets} label="Agua" value={`${saludHoy?.agua || 0}`} detail="vasos" tone="blue" />
          <SummaryMetric icon={Activity} label="Actividad" value={`${exercise}`} detail={latestActivity ? `${latestActivity.tipo || 'actividad'} · ${latestActivity.calorias || 0} kcal est.` : 'minutos'} tone="green" />
          <SummaryMetric icon={Moon} label="Sueño" value={saludHoy?.suenoHoras ? `${saludHoy.suenoHoras}h` : '—'} detail={saludHoy?.calidadSueno || 'sin registrar'} tone="violet" />
          <SummaryMetric icon={CheckCircle2} label="Hábitos" value={`${habitsDone}/${activeHabits.length}`} detail="periodo actual" tone="amber" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <span aria-hidden="true">{mood.emoji}</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">{mood.label}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 dark:text-slate-400">Estrés {saludHoy?.estres ?? '—'}/100</span>
          <button type="button" onClick={() => onOpenSection('analisis')} className="ml-auto text-xs font-black text-cyan-700 hover:underline dark:text-cyan-300">Ver progreso</button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Acciones rápidas de Salud">
        <button type="button" onClick={addWater} className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sky-800 transition hover:-translate-y-0.5 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-200">
          <strong className="block text-sm">+ Agregar agua</strong><span className="text-xs opacity-75">{saludHoy?.agua || 0}/20 vasos</span>
        </button>
        <button type="button" onClick={() => onOpenSection('habitos')} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-emerald-800 transition hover:-translate-y-0.5 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          <strong className="block text-sm">Marcar hábito</strong><span className="text-xs opacity-75">Revisa tus hábitos activos</span>
        </button>
        <button type="button" onClick={() => onOpenSection('herramientas')} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-violet-800 transition hover:-translate-y-0.5 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-200">
          <strong className="block text-sm">Registrar actividad</strong><span className="text-xs opacity-75">Tipo, minutos y estimación</span>
        </button>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900" aria-labelledby="health-checkin-title">
        <div className="flex items-center gap-2"><Smile size={18} className="text-cyan-600 dark:text-cyan-300" aria-hidden="true" /><h3 id="health-checkin-title" className="text-sm font-black text-slate-900 dark:text-white">Check-in de hoy</h3><span className="text-xs text-slate-400">registro subjetivo</span></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Sueño (horas)
            <input key={`sleep-${saludHoy?.fecha || 'today'}-${saludHoy?.suenoHoras ?? ''}`} aria-label="Horas de sueño" type="number" min="0" max="24" step="0.5" defaultValue={saludHoy?.suenoHoras || ''} onChange={(event) => setSleep(event.target.value)} onBlur={saveSleep} placeholder="Ej. 7.5" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          <fieldset><legend className="text-xs font-bold text-slate-600 dark:text-slate-300">Calidad del sueño</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{sleepQualities.map((quality) => <button type="button" key={quality} onClick={() => updateHealthStat('calidadSueno', quality)} aria-pressed={saludHoy?.calidadSueno === quality} className={`rounded-xl px-2 py-2 text-xs font-bold capitalize ${saludHoy?.calidadSueno === quality ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{quality}</button>)}</div></fieldset>
          <fieldset><legend className="text-xs font-bold text-slate-600 dark:text-slate-300">Ánimo</legend><div className="mt-2 flex gap-2">{moods.map((item) => <button type="button" key={item.value} onClick={() => updateHealthStat('animo', item.value)} aria-pressed={saludHoy?.animo === item.value} className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold ${saludHoy?.animo === item.value ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{item.emoji} {item.label}</button>)}</div></fieldset>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Estrés subjetivo: <span className="text-cyan-600">{saludHoy?.estres ?? 50}/100</span>
            <input aria-label="Estrés subjetivo" type="range" min="0" max="100" value={saludHoy?.estres ?? 50} onChange={(event) => updateHealthStat('estres', Number(event.target.value))} className="mt-3 w-full accent-cyan-600" />
          </label>
        </div>
      </section>

      {activeHabits.length > 0 && <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900" aria-labelledby="health-quick-habits-title">
        <div className="flex items-center justify-between"><h3 id="health-quick-habits-title" className="text-sm font-black text-slate-900 dark:text-white">Hábitos activos</h3><span className="text-xs text-slate-500">{habitsDone}/{activeHabits.length} en su periodo</span></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{activeHabits.slice(0, 4).map((habit) => { const completed = getHabitPeriodStatus(habit.id, habit.frecuencia || 'Diario', history).completed; return <button type="button" key={habit.id} onClick={() => toggleHabit(habit)} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left dark:border-slate-800"><span aria-hidden="true">{completed ? '✅' : '⬜'}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-800 dark:text-slate-200">{habit.nombre}</strong><small className="text-[10px] text-slate-500">{habit.frecuencia || 'Diario'} · {frequencyLabel(habit.frecuencia)}</small></span></button>; })}</div>
      </section>}
    </div>
  );
}
