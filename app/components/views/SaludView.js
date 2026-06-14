"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Droplets, CheckCircle2, Trash2, RefreshCw, Activity, Heart, Apple, BarChart3, Users } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { motion } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

import NutricionTab from './NutricionTab';
import IACoachTab from './IACoachTab';
import RecetasTab from './RecetasTab';
import DeficitCalorico from './DeficitCalorico';
import ComunidadTab from './ComunidadTab';
import HerramientasTab from './HerramientasTab';
import RefrigeradorTab from './RefrigeradorTab';
import SeguimientoTab from './SeguimientoTab';
import OnboardingModal from '../ui/OnboardingModal';
import VitalidadPetCard from '../ui/VitalidadPetCard';

import { useComunidadPet } from '@/app/hooks/useComunidadPet';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { playSound } from '@/app/utils/petSounds';
import { useDashboard } from '@/context/dashboard';
import { getTodayKey } from '@/app/utils/helpers';

export default function SaludView() {
  const { user, ui, data, actions } = useDashboard();

  const { saludSubTab, setSaludSubTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { saludHoy, habitos, historialSalud } = data;
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
    analizarCompatibilidad
  } = actions;

  const isPro = user?.plan === 'pro';
  const [fastingTime, setFastingTime] = useState('00:00:00');

  const {
    pet,
    estadoEmocional,
    cambiarTipo,
    renombrar,
    registrarAgua,
    registrarHabitoPet,
    registrarComidaPet,
    actualizarStats
  } = useComunidadPet(user?.uid || user?.id);

  const handleAcariciar = () => {
    playSound('pet');
    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + 8),
      energia: Math.min(100, pet.energia + 3),
      experiencia: pet.experiencia + 5
    });
  };

  const handleJugar = () => {
    playSound('play');
    actualizarStats({
      felicidad: Math.min(100, pet.felicidad + 15),
      energia: Math.max(0, pet.energia - 10),
      salud: Math.min(100, pet.salud + 5),
      experiencia: pet.experiencia + 25
    });
  };

  // Calcula stats diarios para pasar al componente
  const dailyStats = {
    agua: saludHoy?.agua || 0,
    ejercicioMinutos: saludHoy?.ejercicioMinutos || 0,
    diasSinActividad: pet.diasSinActividad,
    diasConsecutivos: Math.floor((Date.now() - new Date(pet.fechaAdopcion).getTime()) / (1000 * 60 * 60 * 24))
  };

  const { showOnboarding, completeOnboarding } = useOnboarding(user);

  // 5 tabs consolidados (de 11). Combinan componentes relacionados.
  const tabs = [
    { title: 'Vitalidad', icon: Heart, id: 'vitalidad' },
    { title: 'Nutrición', icon: Apple, id: 'nutricion' },
    { title: 'Hábitos', icon: CheckCircle2, id: 'habitos' },
    { title: 'Análisis', icon: BarChart3, id: 'analisis' },
    { title: 'Comunidad', icon: Users, id: 'comunidad' }
  ];

  const handleTabChange = setSaludSubTab;

  const tabsForExpandable = tabs.map(t => ({ title: t.title, icon: t.icon }));

  useEffect(() => {
    let interval;
    if (saludHoy?.ayunoInicio) {
      interval = setInterval(() => {
        const diff = Date.now() - saludHoy.ayunoInicio;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setFastingTime(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [saludHoy?.ayunoInicio]);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="sticky top-0 z-10 mb-4">
        <ExpandableTabs
          tabs={tabsForExpandable}
          className="border-[var(--life-border-soft)] bg-[var(--life-surface-2)]"
          activeColor="text-emerald-500"
          onChange={(index) => {
            if (index !== null) {
              handleTabChange(tabs[index].id);
            }
          }}
        />
      </div>

      {/* Animación CSS (compositor): el cambio de tab no depende de rAF/JS */}
      <div key={saludSubTab} className="w-full animate-fade-in-scale">
          {saludSubTab === 'vitalidad' && (
            <div className="space-y-6">
              <VitalidadPetCard
                pet={pet}
                estadoEmocional={estadoEmocional}
                onChangeTipo={cambiarTipo}
                onRename={renombrar}
                userHealth={user?.physicalProfile}
                onAcariciar={handleAcariciar}
                onJugar={handleJugar}
                dailyStats={dailyStats}
              />
            </div>
          )}

          {saludSubTab === 'nutricion' && (
            <div className="space-y-6">
              <NutricionTab
                saludHoy={saludHoy}
                registrarAlimento={registrarAlimento}
                removeAlimento={removeAlimento}
                isPro={isPro}
                setModalOpen={setModalOpen}
                registrarComidaPet={registrarComidaPet}
                removeWater={removeWater}
                addWater={addWater}
                registrarAgua={registrarAgua}
                playSound={playSound}
              />
              <RecetasTab
                saludHoy={saludHoy}
                isPro={isPro}
                setModalOpen={setModalOpen}
                pesoUsuario={75}
                user={user}
                registrarAlimento={registrarAlimento}
                registrarComidaPet={registrarComidaPet}
              />
              <DeficitCalorico saludHoy={saludHoy} isPro={isPro} usuario={{ peso: 75, altura: 175, edad: 30 }} />
              <RefrigeradorTab user={user} todasLasRecetas={[]} registrarComidaPet={registrarComidaPet} />
            </div>
          )}

          {saludSubTab === 'habitos' && (
            <div className="space-y-6">
              <SeguimientoTab saludHoy={saludHoy} historialSalud={historialSalud} />
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
                          whileScale={{ scale: 1.1 }}
                          onClick={() => {
                            toggleHabitCheck(h.id);
                            registrarHabitoPet();
                          }}
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                            saludHoy?.habitosChecks?.includes(h.id)
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                          }`}
                        >
                          <CheckCircle2 size={24} />
                        </motion.button>
                        <span className={`text-sm font-bold ${saludHoy?.habitosChecks?.includes(h.id) ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {h.nombre}
                        </span>
                      </div>
                      <button onClick={() => deleteItem('habitos', h)} className="text-rose-500 opacity-0 transition-opacity group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="rounded-[35px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <div className="text-center">
                  <p className="mb-2 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Hábitos Completados Hoy</p>
                  <h2 className="text-5xl font-black text-emerald-700 dark:text-emerald-300">{saludHoy?.habitosChecks?.length || 0} / {habitos.length}</h2>
                  {saludHoy?.habitosChecks?.length === habitos.length && habitos.length > 0 && <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">¡Completaste todos! ??</p>}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="space-y-4 rounded-[35px] border-2 border-rose-200 bg-white p-6 shadow-lg dark:border-rose-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-gray-400">Movimiento</p>
                    <p className="text-3xl font-black text-rose-600">{saludHoy?.ejercicioMinutos || 0}'</p>
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
            <div className="space-y-6">
              <IACoachTab
                saludHoy={saludHoy}
                predecirBateriaManana={predecirBateriaManana}
                historialSalud={historialSalud}
                analizarCompatibilidad={analizarCompatibilidad}
                isPro={isPro}
                setModalOpen={setModalOpen}
              />
              <div className="space-y-4">
                <PremiumLock isPro={isPro} text="Historial de Salud PRO">
                  {historialSalud.length === 0 ? (
                    <div className="space-y-4 py-20 text-center opacity-30">
                      <Heart size={48} className="mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sin registros previos</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historialSalud.map((dia) => (
                        <div key={dia.id} className="flex items-center justify-between rounded-[35px] border border-gray-50 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-gray-400">{dia.fecha === getTodayKey() ? 'Hoy' : dia.fecha}</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white">
                              {dia.bateria}% <span className="text-[10px] uppercase text-gray-400">Energía</span>
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center rounded-xl bg-blue-50 p-2 dark:bg-blue-900/20">
                              <Droplets size={14} className="text-blue-500" />
                              <span className="mt-1 text-[9px] font-black text-blue-700">{dia.agua}</span>
                            </div>
                            <div className="flex flex-col items-center rounded-xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="mt-1 text-[9px] font-black text-emerald-700">{dia.habitosChecks?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PremiumLock>
              </div>
            </div>
          )}

          {saludSubTab === 'comunidad' && <ComunidadTab isPro={isPro} saludHoy={saludHoy} />}
        </div>

      <OnboardingModal isOpen={showOnboarding} onComplete={completeOnboarding} />
    </div>
  );
}

