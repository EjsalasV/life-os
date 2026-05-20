"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Droplets, CheckCircle2, Trash2, RefreshCw, Activity, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

import NutricionTab from './NutricionTab';
import IACoachTab from './IACoachTab';
import RecetasTab from './RecetasTab';
import DeficitCalorico from './DeficitCalorico';
import ComunidadTab from './ComunidadTab';
import HerramientasTab from './HerramientasTab';
import RefrigeradorTab from './RefrigeradorTab';
import LeaderboardsTab from './LeaderboardsTab';
import OnboardingModal from '../ui/OnboardingModal';
import VitalidadPetCard from '../ui/VitalidadPetCard';

import { useComunidadPet } from '@/app/hooks/useComunidadPet';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { playSound } from '@/app/utils/petSounds';

export default function SaludView({
  saludSubTab,
  setSaludSubTab,
  saludHoy,
  updateHealthStat,
  removeWater,
  addWater,
  habitos,
  toggleHabitCheck,
  deleteItem,
  historialSalud,
  setModalOpen,
  getTodayKey,
  resetDailyHealth,
  user,
  registrarAlimento,
  removeAlimento,
  predecirBateriaManana,
  analizarCompatibilidad
}) {
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

  const tabsOrder = [
    'vitalidad',
    'nutricion',
    'recetas',
    'deficit',
    'habitos',
    'herramientas',
    'ia-coach',
    'comunidad',
    'refrigerador',
    'leaderboards',
    'historial'
  ];

  const tabs = [
    { id: 'vitalidad', label: '💪 Vitalidad' },
    { id: 'nutricion', label: '🍎 Nutrición' },
    { id: 'recetas', label: '🍳 Recetas' },
    { id: 'deficit', label: '⚖️ Déficit' },
    { id: 'habitos', label: '✅ Hábitos' },
    { id: 'herramientas', label: '🛠️ Herramientas' },
    { id: 'ia-coach', label: '🤖 IA Coach' },
    { id: 'comunidad', label: '👥 Comunidad' },
    { id: 'refrigerador', label: '🧊 Refri' },
    { id: 'leaderboards', label: '🏆 Top' },
    { id: 'historial', label: '📊 Historial' }
  ];

  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab) => {
    const oldIndex = tabsOrder.indexOf(saludSubTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setSaludSubTab(newTab);
  };

  const tabVariants = {
    initial: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2 } })
  };

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
      <div className="relative mb-2 flex flex-wrap justify-start gap-2 rounded-2xl bg-gray-100 px-2 py-2 dark:bg-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`relative z-10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase transition-all ${saludSubTab === t.id ? 'text-rose-600' : 'text-gray-400'}`}
          >
            {saludSubTab === t.id && (
              <motion.div layoutId="activeTabSalud" className="absolute inset-0 z-[-1] rounded-xl bg-white shadow-sm dark:bg-gray-700" />
            )}
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={saludSubTab} custom={direction} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="w-full">
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

              <motion.div whileHover={{ scale: 1.02 }} className="space-y-4 rounded-[35px] border-2 border-blue-200 bg-white p-6 shadow-lg dark:border-blue-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-gray-400">Hidratación</p>
                    <p className="text-3xl font-black text-blue-600">{saludHoy?.agua || 0}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">vasos de agua</p>
                  </div>
                  <Droplets className="text-blue-500" size={40} />
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={removeWater} className="flex-1 rounded-2xl bg-gray-100 py-3 font-black text-gray-900 transition-all hover:shadow-md dark:bg-gray-700 dark:text-white">
                    -
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSound('drink');
                      addWater();
                      registrarAgua();
                    }}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-black text-white transition-all hover:shadow-lg"
                  >
                    + Agua
                  </motion.button>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-700 dark:bg-blue-900/20">
                  <p className="text-[9px] font-semibold text-blue-700 dark:text-blue-300">? +10% energía al mascota por cada vaso</p>
                </motion.div>
              </motion.div>

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

          {saludSubTab === 'nutricion' && (
            <NutricionTab
              saludHoy={saludHoy}
              registrarAlimento={registrarAlimento}
              removeAlimento={removeAlimento}
              isPro={isPro}
              setModalOpen={setModalOpen}
              registrarComidaPet={registrarComidaPet}
            />
          )}

          {saludSubTab === 'recetas' && (
            <RecetasTab
              saludHoy={saludHoy}
              isPro={isPro}
              setModalOpen={setModalOpen}
              pesoUsuario={75}
              user={user}
              registrarAlimento={registrarAlimento}
              registrarComidaPet={registrarComidaPet}
            />
          )}

          {saludSubTab === 'deficit' && <DeficitCalorico saludHoy={saludHoy} isPro={isPro} usuario={{ peso: 75, altura: 175, edad: 30 }} />}

          {saludSubTab === 'habitos' && (
            <div className="space-y-6">
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
            </div>
          )}

          {saludSubTab === 'herramientas' && <HerramientasTab user={user} />}

          {saludSubTab === 'ia-coach' && (
            <IACoachTab
              saludHoy={saludHoy}
              predecirBateriaManana={predecirBateriaManana}
              historialSalud={historialSalud}
              analizarCompatibilidad={analizarCompatibilidad}
              isPro={isPro}
              setModalOpen={setModalOpen}
            />
          )}

          {saludSubTab === 'comunidad' && <ComunidadTab isPro={isPro} saludHoy={saludHoy} />}

          {saludSubTab === 'refrigerador' && (
            <RefrigeradorTab user={user} todasLasRecetas={[]} registrarComidaPet={registrarComidaPet} />
          )}

          {saludSubTab === 'leaderboards' && <LeaderboardsTab comunidadData={{}} />}

          {saludSubTab === 'historial' && (
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
          )}
        </motion.div>
      </AnimatePresence>

      <OnboardingModal isOpen={showOnboarding} onComplete={completeOnboarding} />
    </div>
  );
}

