"use client";
import React, { useMemo, useState } from 'react';
import { Zap, Droplets, CheckCircle2, Trash2, RefreshCw, Activity, Heart, Apple, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import NutricionTab from './NutricionTab';
import IACoachTab from './IACoachTab';
import RecetasTab from './RecetasTab';
import DeficitCalorico from './DeficitCalorico';
import ComunidadTab from './ComunidadTab';
import HerramientasTab from './HerramientasTab';
import RefrigeradorTab from './RefrigeradorTab';
import OnboardingModal from '../ui/OnboardingModal';
import VitalidadPetCard from '../ui/VitalidadPetCard';
import { AdventureIcon } from '../ui/AdventureIcons';
import AdventureHabitsTab from './salud/AdventureHabitsTab';
import AdventureMoreHub from './salud/AdventureMoreHub';
import HealthTodayPanel from './salud/HealthTodayPanel';
import HealthProgressPanel from './salud/HealthProgressPanel';

import { useComunidadPet } from '@/app/hooks/useComunidadPet';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { playSound } from '@/app/utils/petSounds';
import { useDashboard } from '@/context/dashboard';
import { getTodayKey } from '@/app/utils/helpers';
import { resolveCurrentWeight, getDailyExerciseMinutes } from '@/app/lib/healthProfile';
import { getHabitPeriodStatus } from '@/modules/health/habitPeriod';

function hasMeaningfulActivity(day) {
  if (!day) return false;

  return (
    (day.agua || 0) > 0 ||
    getDailyExerciseMinutes(day) > 0 ||
    (day.habitosChecks?.length || 0) > 0 ||
    (day.alimentos?.length || 0) > 0
  );
}

function getHealthConsistencyStreak(saludHoy, historialSalud) {
  const daysByDate = new Map();

  [saludHoy, ...(historialSalud || [])].forEach((day) => {
    if (day?.fecha && !daysByDate.has(day.fecha)) {
      daysByDate.set(day.fecha, day);
    }
  });

  let streak = 0;
  let cursor = new Date();

  while (true) {
    const key = getTodayKey(cursor);
    const day = daysByDate.get(key);

    if (!hasMeaningfulActivity(day)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function SaludView({ personality }) {
  const { user, ui, data, actions } = useDashboard();

  const { saludSubTab, setSaludSubTab } = ui.navigation;
  const [nutritionTool, setNutritionTool] = useState(null);
  const [toolsTab, setToolsTab] = useState('ayuno');
  const { setModalOpen } = ui.modals;
  const { saludHoy, habitos, historialSalud, historialPeso } = data;
  const {
    updateHealthStat,
    removeWater,
    addWater,
    toggleHabitCheck,
    deleteItem,
    resetDailyHealth,
    registrarAlimento,
    removeAlimento,
    predecirBateriaManana,
    analizarCompatibilidad,
    toggleFasting,
    restoreFasting
  } = actions;

  const isPro = user?.plan === 'pro';
  const physicalProfile = user?.physicalProfile;
  const pesoActual = useMemo(
    () => resolveCurrentWeight(historialPeso, physicalProfile),
    [historialPeso, physicalProfile]
  );
  const healthProfile = useMemo(() => (
    physicalProfile
      ? { ...physicalProfile, ...(pesoActual ? { peso: pesoActual } : {}) }
      : null
  ), [physicalProfile, pesoActual]);
  const consistencyStreak = getHealthConsistencyStreak(saludHoy, historialSalud);
  const habitHistory = [saludHoy, ...(historialSalud || [])].filter(Boolean);
  const isHabitCompleted = (habit) => getHabitPeriodStatus(
    habit.id,
    habit.frecuencia || 'Diario',
    habitHistory
  ).completed;
  const habitsDone = habitos.filter(isHabitCompleted).length;

  const {
    pet, petError,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    registrarAgua,
    registrarHabitoPet,
    registrarComidaPet,
    registrarAcariciarPet,
    registrarJugarPet,
    registrarActividadPet,
    registrarDormirPet
  } = useComunidadPet(user?.uid || user?.id);

  const handleAcariciar = () => {
    playSound('pet');
    registrarAcariciarPet();
  };

  const handleJugar = () => {
    playSound('play');
    registrarJugarPet();
  };

  // Calcula stats diarios para pasar al componente
  const dailyStats = {
    agua: saludHoy?.agua || 0,
    ejercicioMinutos: getDailyExerciseMinutes(saludHoy),
    diasSinActividad: pet.diasSinActividad,
    diasConsecutivos: consistencyStreak,
    habitosDone: habitsDone,
    habitosTotal: habitos.length
  };

  const habitsTotal = habitos.length;
  const { showOnboarding, completeOnboarding } = useOnboarding(user);

  // Conservamos los IDs internos para compatibilidad, pero mostramos una navegación orientada al uso diario.
  const tabs = [
    { title: 'Hoy', icon: Heart, id: 'vitalidad' },
    { title: 'Nutrición', icon: Apple, id: 'nutricion' },
    { title: 'Hábitos', icon: CheckCircle2, id: 'habitos' },
    { title: 'Progreso', icon: BarChart3, id: 'analisis' },
    { title: 'Herramientas', icon: RefreshCw, id: 'herramientas' }
  ];

  const handleTabChange = (nextTab) => {
    if (nextTab !== 'nutricion') setNutritionTool(null);
    setSaludSubTab(nextTab);
  };

  const openHealthSection = (nextTab) => {
    if (nextTab === 'herramientas') setToolsTab('deficit');
    handleTabChange(nextTab);
  };

  const activeTab = tabs.find((tab) => tab.id === saludSubTab) || tabs[0];

  return (
    <div className={`space-y-5 overflow-x-hidden ${personality === 'aventura' ? 'health-module-adventure' : ''}`}>
      {petError && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{petError}</p>}
      <section className="health-hero relative overflow-hidden rounded-[28px] p-5">
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[var(--life-accent)]">
              <Sparkles size={15} />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">Resumen de hoy</span>
            </div>
            <h1 className="max-w-[15rem] text-3xl font-black leading-tight tracking-tight">Pequeños pasos, mejor energía.</h1>
            <p className="mt-2 max-w-[22rem] text-sm font-medium text-[var(--life-text-dim)]">Registra una acción y deja que tu salud avance contigo.</p>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-black/15 px-3 py-2"><Droplets size={15} className="mb-1 text-cyan-500" /><p className="text-lg font-black text-[var(--life-text)]">{dailyStats.agua}</p><p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">vasos</p></div>
          <div className="rounded-2xl bg-black/15 px-3 py-2"><Activity size={15} className="mb-1 text-emerald-500" /><p className="text-lg font-black text-[var(--life-text)]">{dailyStats.ejercicioMinutos}′</p><p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">movimiento</p></div>
          <div className="rounded-2xl bg-black/15 px-3 py-2"><CheckCircle2 size={15} className="mb-1 text-amber-500" /><p className="text-lg font-black text-[var(--life-text)]">{habitsDone}/{habitsTotal}</p><p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">hábitos</p></div>
        </div>
      </section>
      {personality === 'aventura' ? (
        <nav className="health-tabs-adventure" aria-label="Secciones de Salud">
          {[
            { id: 'vitalidad', label: 'HOY', icon: 'health' },
            { id: 'nutricion', label: 'NUTRICIÓN', icon: 'food' },
            { id: 'habitos', label: 'HÁBITOS', icon: 'habit' },
            { id: 'analisis', label: 'PROGRESO', icon: 'star' }
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`health-tab-adventure ${saludSubTab === tab.id ? 'is-active' : ''}`}
              aria-pressed={saludSubTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              <AdventureIcon type={tab.icon} size={17} color="currentColor" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      ) : <div className="sticky top-0 z-10 -mx-1 rounded-[26px] border border-slate-200/80 bg-slate-50/95 p-2 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <label htmlFor="salud-section" className="sr-only">Sección de Salud</label>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 dark:bg-slate-800">
          <activeTab.icon size={20} aria-hidden="true" className="text-cyan-600 dark:text-cyan-300" />
          <select
            id="salud-section"
            value={saludSubTab}
            onChange={(event) => handleTabChange(event.target.value)}
            className="min-w-0 flex-1 appearance-none bg-transparent text-base font-black text-slate-900 outline-none dark:text-white"
          >
            {tabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.title}</option>)}
          </select>
          <span aria-hidden="true" className="text-xs font-black text-slate-400">▾</span>
        </div>
      </div>}

      {/* Animación CSS (compositor): el cambio de tab no depende de rAF/JS */}
      <div key={saludSubTab} className="w-full animate-fade-in-scale">
          {saludSubTab === 'vitalidad' && (
            <div className="space-y-6">
              <HealthTodayPanel
                saludHoy={saludHoy}
                habitos={habitos}
                historialSalud={historialSalud}
                updateHealthStat={updateHealthStat}
                addWater={addWater}
                removeWater={removeWater}
                toggleHabitCheck={toggleHabitCheck}
                registrarHabitoPet={registrarHabitoPet}
                onOpenSection={openHealthSection}
              />
              <VitalidadPetCard
                pet={pet}
                estadoEmocional={estadoEmocional}
                onChangeTipo={cambiarTipo}
                onRename={renombrar}
                userHealth={user?.physicalProfile}
                onAcariciar={handleAcariciar}
                onJugar={handleJugar}
                dailyStats={dailyStats}
                onRegistrarAgua={registrarAgua}
                onRegistrarComida={() => registrarComidaPet(true, 400)}
                onRegistrarActividad={registrarActividadPet}
                onRegistrarDormir={registrarDormirPet}
                adventure={personality === 'aventura'}
              />
            </div>
          )}

          {saludSubTab === 'nutricion' && (
            <div className="space-y-6">
              <NutricionTab
                user={user}
                saludHoy={saludHoy}
                historialSalud={historialSalud}
                registrarAlimento={registrarAlimento}
                removeAlimento={removeAlimento}
                isPro={isPro}
                setModalOpen={setModalOpen}
                registrarComidaPet={registrarComidaPet}
                removeWater={removeWater}
                addWater={addWater}
                registrarAgua={registrarAgua}
                playSound={playSound}
                adventure={personality === 'aventura'}
                activeTool={nutritionTool}
                onSelectTool={setNutritionTool}
                onBackToNutrition={() => setNutritionTool(null)}
              />
              {personality !== 'aventura' && <RecetasTab
                saludHoy={saludHoy}
                isPro={isPro}
                setModalOpen={setModalOpen}
                pesoUsuario={pesoActual}
                user={user}
                registrarAlimento={registrarAlimento}
                registrarComidaPet={registrarComidaPet}
              />}
              {personality !== 'aventura' && <RefrigeradorTab user={user} todasLasRecetas={[]} registrarComidaPet={registrarComidaPet} />}
              {personality === 'aventura' && nutritionTool === 'recipes' && <RecetasTab
                adventure
                onBack={() => setNutritionTool(null)}
                saludHoy={saludHoy}
                isPro={isPro}
                setModalOpen={setModalOpen}
                pesoUsuario={pesoActual}
                user={user}
                registrarAlimento={registrarAlimento}
                registrarComidaPet={registrarComidaPet}
              />}
              {personality === 'aventura' && nutritionTool === 'objective' && <DeficitCalorico
                adventure
                onBack={() => setNutritionTool(null)}
                saludHoy={saludHoy}
                isPro={isPro}
                usuario={healthProfile}
              />}
            </div>
          )}

          {saludSubTab === 'habitos' && (
            personality === 'aventura' ? (
              <AdventureHabitsTab
                habitos={habitos}
                saludHoy={saludHoy}
                historialSalud={historialSalud}
                updateHealthStat={updateHealthStat}
                toggleHabitCheck={toggleHabitCheck}
                registrarHabitoPet={registrarHabitoPet}
                deleteItem={deleteItem}
                onNewHabit={() => setModalOpen('habito')}
                onOpenTracking={() => setSaludSubTab('analisis')}
              />
            ) : <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black uppercase text-gray-400">Mis Hábitos</h3>
                  <button onClick={() => setModalOpen('habito')} className="font-bold text-blue-600">+ Agregar</button>
                </div>

                {habitos.length === 0 ? (
                  <div className="py-8 text-center opacity-50">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-[10px] font-bold uppercase text-gray-400">Sin hábitos registrados</p>
                  </div>
                ) : (
                  habitos.map((h) => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group flex items-center justify-between rounded-[28px] border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex flex-1 items-center gap-4">
                        <motion.button
                          whileTap={{ scale: 1.1 }}
                            aria-label={`Marcar hábito ${h.nombre}`}
                          onClick={async () => {
                            const wasChecked = isHabitCompleted(h);
                            if (await toggleHabitCheck(h.id, h.frecuencia || 'Diario') && !wasChecked) await registrarHabitoPet();
                          }}
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                            isHabitCompleted(h)
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                          }`}
                        >
                          <CheckCircle2 size={24} />
                        </motion.button>
                        <span className={`text-sm font-bold ${isHabitCompleted(h) ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {h.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-[10px] font-bold text-slate-400 sm:inline">{h.frecuencia || 'Diario'}</span>
                        <button type="button" title="Archivar hábito" aria-label={`Archivar hábito ${h.nombre}`} onClick={() => deleteItem('habitos', h)} className="text-slate-400 opacity-60 transition-opacity hover:text-amber-600 sm:opacity-0 sm:group-hover:opacity-100">
                        <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="rounded-[35px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <div className="text-center">
                  <p className="mb-2 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Hábitos Completados Hoy</p>
                  <h2 className="text-5xl font-black text-emerald-700 dark:text-emerald-300">{habitsDone} / {habitos.length}</h2>
                  {habitsDone === habitos.length && habitos.length > 0 && <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">¡Completaste todos! 🎉</p>}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="space-y-4 rounded-[35px] border-2 border-rose-200 bg-white p-6 shadow-lg dark:border-rose-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-gray-400">Movimiento</p>
                    <p className="text-3xl font-black text-rose-600">{getDailyExerciseMinutes(saludHoy)}'</p>
                  </div>
                  <Activity className="text-rose-500" size={40} />
                </div>
                <div className="flex gap-2">
                  {[15, 30, 60].map((m) => (
                    <motion.button
                      key={m}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateHealthStat('ejercicioMinutos', m)}
                      className={`flex-1 rounded-2xl py-3 text-[11px] font-black transition-all ${
                        saludHoy?.ejercicioMinutos === m
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:shadow-md dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {m}min
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {saludSubTab === 'analisis' && (
            personality === 'aventura' ? (
              <AdventureMoreHub
                user={user}
                saludHoy={saludHoy}
                historialSalud={historialSalud}
                isPro={isPro}
                predecirBateriaManana={predecirBateriaManana}
                analizarCompatibilidad={analizarCompatibilidad}
                setModalOpen={setModalOpen}
                toggleFasting={toggleFasting}
                restoreFasting={restoreFasting}
                healthProfile={healthProfile}
              />
            ) : <div className="space-y-6">
              <HealthProgressPanel
                saludHoy={saludHoy}
                historialSalud={historialSalud}
                historialPeso={historialPeso}
                habitos={habitos}
                physicalProfile={physicalProfile}
              />
              <IACoachTab
                saludHoy={saludHoy}
                predecirBateriaManana={predecirBateriaManana}
                historialSalud={historialSalud}
                analizarCompatibilidad={analizarCompatibilidad}
                isPro={isPro}
                setModalOpen={setModalOpen}
              />
            </div>
          )}

          {saludSubTab === 'herramientas' && <HerramientasTab user={user} saludHoy={saludHoy} toggleFasting={toggleFasting} restoreFasting={restoreFasting} healthProfile={healthProfile} isPro={isPro} initialTab={toolsTab} />}

          {saludSubTab === 'comunidad' && <ComunidadTab isPro={isPro} saludHoy={saludHoy} />}
        </div>

      <OnboardingModal isOpen={showOnboarding} onComplete={completeOnboarding} />
    </div>
  );
}
