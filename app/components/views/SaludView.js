"use client";
import React, { useState, useEffect } from 'react';
import {
  Zap, Droplets, CheckCircle2, Trash2, Plus,
  Clock, Smile, Meh, Frown, Coffee, Utensils, Pizza, RefreshCw, Activity,
  Heart, Scale as ScaleIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

import NutricionTab from './NutricionTab';
import IACoachTab from './IACoachTab';
import RecetasTab from './RecetasTab';
import DeficitCalorico from './DeficitCalorico';
import ComunidadTab from './ComunidadTab';
import HerramientasTab from './HerramientasTab';
import RefrigeradorTab from './RefrigeradorTab';
import LeaderboardPetsTab from './LeaderboardPetsTab';
import LeaderboardsTab from './LeaderboardsTab';
import PixelPetEvolution from '../ui/PixelPetEvolution';
import OnboardingModal from '../ui/OnboardingModal';
import PetSelector from '../ui/PetSelector';

import { useComunidadPet } from '@/app/hooks/useComunidadPet';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { RecetasBase } from '@/app/constants/recetas-base';

export default function SaludView({
  saludSubTab, setSaludSubTab, saludHoy, updateHealthStat,
  removeWater, addWater, toggleComida, habitos, toggleHabitCheck,
  deleteItem, historialPeso, historialSalud, setModalOpen, toggleFasting, getTodayKey, resetDailyHealth,
  user, registrarAlimento, removeAlimento, predecirBateriaManana, analizarCompatibilidad
}) {
  const isPro = user?.plan === 'pro';
  const [fastingTime, setFastingTime] = useState('00:00:00');
  const [showMealOptions, setShowMealOptions] = useState(null);

  const {
    pet,
    pets,
    petActivoId,
    estadoEmocional,
    registrarAgua,
    registrarHabitoPet,
    registrarComidaPet,
    adoptarPet,
    cambiarPetActivo,
    eliminarPet
  } = useComunidadPet(user?.uid);
  const { showOnboarding, completeOnboarding } = useOnboarding(user);

  const tabs = [
    { id: 'vitalidad', label: '⚡ Vitalidad' },
    { id: 'nutricion', label: '🥗 Nutrición' },
    { id: 'recetas', label: '👨‍🍳 Recetas' },
    { id: 'deficit', label: '📊 Déficit' },
    { id: 'habitos', label: '✅ Hábitos' },
    { id: 'herramientas', label: '🛠️ Herramientas' },
    { id: 'ia-coach', label: '🤖 IA Coach' },
    { id: 'comunidad', label: '👥 Comunidad' },
    { id: 'refrigerador', label: '🧊 Refri' },
    { id: 'leaderboard-pets', label: '🏆 Mis Pets' },
    { id: 'leaderboards', label: '🏆 Top Global' },
    { id: 'historial', label: '📈 Historial' }
  ];

  const tabsOrder = tabs.map((t) => t.id);
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

  const batteryLevel = saludHoy?.bateria || 0;
  const batteryColor = batteryLevel > 70 ? 'text-emerald-500' : batteryLevel > 30 ? 'text-orange-500' : 'text-rose-500';

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap justify-start gap-2 px-2 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 relative">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`relative px-4 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${saludSubTab === t.id ? 'text-rose-600' : 'text-gray-400'}`}
          >
            {saludSubTab === t.id && (
              <motion.div layoutId="activeTabSalud" className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-xl z-[-1]" />
            )}
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={saludSubTab} custom={direction} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="w-full">
          {saludSubTab === 'vitalidad' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Tu Mascota Digital</p>
                    <p className="text-lg font-black mt-1 text-gray-900 dark:text-white">{pet.nombre}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Nivel {pet.nivel}</p>
                  </div>
                  <button onClick={resetDailyHealth} className="text-gray-200 hover:text-rose-500 active:rotate-180 transition-all duration-500">
                    <RefreshCw size={22} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <PixelPetEvolution nivel={pet.nivel} estadoEmocional={estadoEmocional} tipo={pet.tipo || 'gato'} color={pet.color || '#3b82f6'} accesorios={pet.accesorios || []} raridad={pet.raridad || 'comun'} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 shadow-sm">
                <PetSelector
                  pets={pets || []}
                  petActivoId={petActivoId}
                  onSelect={cambiarPetActivo}
                  onAdopt={adoptarPet}
                  onDelete={eliminarPet}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] border border-gray-100 dark:border-gray-700 shadow-sm text-center relative">
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-50 dark:text-gray-700" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${batteryLevel * 2.82} 282`} className={batteryColor} transform="rotate(-90 50 50)" style={{ strokeLinecap: 'round', transition: 'all 1.5s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Zap size={36} className={`${batteryColor} fill-current mb-1`} />
                    <span className="text-4xl font-black tabular-nums">{batteryLevel}%</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Energía Vital</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Hidratación</p>
                    <p className="text-2xl font-black text-blue-600">{saludHoy?.agua || 0}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">vasos de agua</p>
                  </div>
                  <Droplets className="text-blue-500" size={32} />
                </div>
                <div className="flex gap-2">
                  <button onClick={removeWater} className="flex-1 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl font-black">-</button>
                  <button onClick={() => { addWater(); registrarAgua(); }} className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-black hover:bg-blue-600">+</button>
                </div>
              </div>
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
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase">Mis Hábitos</h3>
                  <button onClick={() => setModalOpen('habito')} className="text-blue-600 font-bold">+ Agregar</button>
                </div>

                {habitos.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sin hábitos registrados</p>
                  </div>
                ) : (
                  habitos.map((h) => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                      <div className="flex items-center gap-4 flex-1">
                        <motion.button whileScale={{ scale: 1.1 }} onClick={() => { toggleHabitCheck(h.id); registrarHabitoPet(); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${saludHoy?.habitosChecks?.includes(h.id) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                          <CheckCircle2 size={24} />
                        </motion.button>
                        <span className={`text-sm font-bold ${saludHoy?.habitosChecks?.includes(h.id) ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{h.nombre}</span>
                      </div>
                      <button onClick={() => deleteItem('habitos', h)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-[35px] border border-emerald-200 dark:border-emerald-700">
                <div className="text-center">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2">Hábitos Completados Hoy</p>
                  <h2 className="text-5xl font-black text-emerald-700 dark:text-emerald-300">{saludHoy?.habitosChecks?.length || 0} / {habitos.length}</h2>
                  {saludHoy?.habitosChecks?.length === habitos.length && habitos.length > 0 && (
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">¡Completaste todos! 🎉</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {saludSubTab === 'herramientas' && <HerramientasTab user={user} />}

          {saludSubTab === 'ia-coach' && (
            <IACoachTab saludHoy={saludHoy} predecirBateriaManana={predecirBateriaManana} historialSalud={historialSalud} analizarCompatibilidad={analizarCompatibilidad} isPro={isPro} setModalOpen={setModalOpen} />
          )}

          {saludSubTab === 'comunidad' && <ComunidadTab isPro={isPro} saludHoy={saludHoy} />}

          {saludSubTab === 'refrigerador' && (
            <RefrigeradorTab
              user={user}
              todasLasRecetas={Object.values(RecetasBase || {})}
              registrarComidaPet={registrarComidaPet}
            />
          )}

          {saludSubTab === 'leaderboard-pets' && <LeaderboardPetsTab user={user} />}

          {saludSubTab === 'leaderboards' && <LeaderboardsTab comunidadData={{}} />}

          {saludSubTab === 'historial' && (
            <div className="space-y-4">
              <PremiumLock isPro={isPro} text="Historial de Salud PRO">
                {historialSalud.length === 0 ? (
                  <div className="py-20 text-center space-y-4 opacity-30"><Heart size={48} className="mx-auto" /><p className="text-[10px] font-black uppercase tracking-widest">Sin registros previos</p></div>
                ) : (
                  <div className="space-y-3">
                    {historialSalud.map((dia) => (
                      <div key={dia.id} className="bg-white dark:bg-gray-800 p-5 rounded-[35px] border border-gray-50 dark:border-gray-700 flex items-center justify-between shadow-sm">
                        <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase">{dia.fecha === getTodayKey() ? 'Hoy' : dia.fecha}</span><span className="text-lg font-black text-gray-900 dark:text-white">{dia.bateria}% <span className="text-[10px] text-gray-400 uppercase">Energía</span></span></div>
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Droplets size={14} className="text-blue-500" /><span className="text-[9px] font-black text-blue-700 mt-1">{dia.agua}</span></div>
                          <div className="flex flex-col items-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-[9px] font-black text-emerald-700 mt-1">{dia.habitosChecks?.length || 0}</span></div>
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
