"use client";
import React, { useState, useEffect } from 'react';
import { 
  Zap, Droplets, Moon, CheckCircle2, Scale, Trash2, Plus, 
  Clock, Smile, Meh, Frown, Coffee, Utensils, Pizza, RefreshCw, Activity,
  Timer, Heart, ChevronDown, Scale as ScaleIcon, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

/**
 * SALUD VIEW - EXPERT EDITION CON IA Y ANÁLISIS NUTRICIONAL AVANZADO
 * Gestión de protocolos de salud con transiciones fluidas y lógica de dirección.
 */
import NutricionTab from './NutricionTab';
import IACoachTab from './IACoachTab';
import RecetasTab from './RecetasTab';
import DeficitCalorico from './DeficitCalorico';
import ComunidadTab from './ComunidadTab';
import PixelPet from '../ui/PixelPet';
import { useComunidadPet } from '@/app/hooks/useComunidadPet';

export default function SaludView({
  saludSubTab, setSaludSubTab, saludHoy, updateHealthStat,
  removeWater, addWater, toggleComida, habitos, toggleHabitCheck,
  deleteItem, historialPeso, historialSalud, setModalOpen, toggleFasting, getTodayKey, resetDailyHealth,
  user, registrarAlimento, removeAlimento, predecirBateriaManana, analizarCompatibilidad
}) {

  const isPro = user?.plan === 'pro';
  const [fastingTime, setFastingTime] = useState('00:00:00');
  const [showMealOptions, setShowMealOptions] = useState(null);
  const { pet, estadoEmocional, petVisuals, registrarAgua } = useComunidadPet(user?.id);

  // --- LÓGICA DE ANIMACIÓN ---
  const tabsOrder = ['vitalidad', 'nutricion', 'recetas', 'deficit', 'habitos', 'ia-coach', 'comunidad', 'historial'];
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab) => {
    const oldIndex = tabsOrder.indexOf(saludSubTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setSaludSubTab(newTab);
  };

  const tabVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.2 }
    })
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
      {/* TABS DE SALUD CON INDICADOR ANIMADO */}
      <div className="flex flex-wrap justify-start gap-2 px-2 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 relative">
        {tabsOrder.map(t => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`relative px-4 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${saludSubTab === t ? 'text-rose-600' : 'text-gray-400'}`}
          >
            {saludSubTab === t && (
              <motion.div 
                layoutId="activeTabSalud" 
                className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-xl z-[-1]" 
              />
            )}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={saludSubTab}
          custom={direction}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* 1. VITALIDAD */}
          {saludSubTab === 'vitalidad' && (
            <div className="space-y-6">
              {/* MASCOTA DIGITAL - HEADER */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Tu Mascota Digital</p>
                    <p className="text-lg font-black mt-1 text-gray-900 dark:text-white">{pet.nombre}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Nivel {pet.nivel}</p>
                  </div>
                  <button
                    onClick={resetDailyHealth}
                    className="text-gray-200 hover:text-rose-500 active:rotate-180 transition-all duration-500"
                  >
                    <RefreshCw size={22}/>
                  </button>
                </div>
              </div>

              {/* PIXELPET VISUAL */}
              <div className="flex justify-center">
                <PixelPet estadoEmocional={estadoEmocional} />
              </div>

              {/* ESTADÍSTICAS DEL PET */}
              <div className="grid grid-cols-3 gap-3">
                {/* SALUD */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart size={14} className="text-rose-500" />
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Salud</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                      animate={{ width: `${pet.salud}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.salud)}%</p>
                </div>

                {/* FELICIDAD */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[14px]">😊</span>
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Felicidad</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                      animate={{ width: `${pet.felicidad}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.felicidad)}%</p>
                </div>

                {/* ENERGÍA */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Energía</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                      animate={{ width: `${pet.energia}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.energia)}%</p>
                </div>
              </div>

              {/* HIDRATACIÓN - CON FEEDBACK VISUAL */}
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
                  <button onClick={removeWater} className="flex-1 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl font-black text-gray-900 dark:text-white">-</button>
                  <button
                    onClick={() => {
                      addWater();
                      registrarAgua();
                    }}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-black hover:bg-blue-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold text-center">+10% energía al mascota por cada vaso</p>
              </div>

              {/* MOVIMIENTO */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-3 shadow-sm">
                 <div className="flex justify-between items-center"><Activity className="text-rose-500" size={20}/><span className="font-black text-lg">{saludHoy?.ejercicioMinutos || 0}'</span></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Movimiento (Minutos)</p>
                 <div className="flex gap-1">
                   {[15, 30, 60].map(m => (
                     <button key={m} onClick={() => updateHealthStat('ejercicioMinutos', m)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${saludHoy?.ejercicioMinutos === m ? 'bg-rose-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>{m}</button>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {/* 2. NUTRICIÓN - NUEVO */}
          {saludSubTab === 'nutricion' && (
            <NutricionTab
              saludHoy={saludHoy}
              registrarAlimento={registrarAlimento}
              removeAlimento={removeAlimento}
              isPro={isPro}
              setModalOpen={setModalOpen}
            />
          )}

          {/* 3. RECETAS IA - INNOVADOR */}
          {saludSubTab === 'recetas' && (
            <RecetasTab
              saludHoy={saludHoy}
              isPro={isPro}
              setModalOpen={setModalOpen}
              pesoUsuario={75}
            />
          )}

          {/* 4. DÉFICIT CALÓRICO - CALCULADORA */}
          {saludSubTab === 'deficit' && (
            <DeficitCalorico
              saludHoy={saludHoy}
              isPro={isPro}
              usuario={{ peso: 75, altura: 175, edad: 30 }}
            />
          )}

          {/* 5. HÁBITOS */}
          {saludSubTab === 'habitos' && (
            <div className="space-y-6">
               <div className="bg-[#1a1c2c] text-white p-6 rounded-[40px] flex justify-between items-center shadow-lg relative overflow-hidden">
                  <PremiumLock isPro={isPro} text="Peso PRO">
                    <div className="flex items-center gap-4 w-full justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-500/20 p-3 rounded-2xl text-rose-400"><ScaleIcon size={24}/></div>
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peso Actual</p><h3 className="text-2xl font-black italic">{historialPeso[0]?.peso || '--'} kg</h3></div>
                      </div>
                      <button onClick={() => setModalOpen('peso')} className="bg-white text-black p-4 rounded-2xl shadow-xl active:scale-90 transition-all"><Plus size={20}/></button>
                    </div>
                  </PremiumLock>
               </div>

               <div className="bg-white dark:bg-gray-800 p-6 rounded-[40px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${saludHoy?.ayunoInicio ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}><Clock size={20}/></div>
                        <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contador de Ayuno</p><h4 className="text-xl font-black tabular-nums">{saludHoy?.ayunoInicio ? fastingTime : '00:00:00'}</h4></div>
                     </div>
                     <button onClick={toggleFasting} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${saludHoy?.ayunoInicio ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}>{saludHoy?.ayunoInicio ? "Parar" : "Iniciar"}</button>
                  </div>
               </div>

               <div className="bg-white dark:bg-gray-800 p-6 rounded-[40px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase text-center tracking-widest">Impacto Nutricional</p>
                  <PremiumLock isPro={isPro} text="Análisis de Dieta PRO">
                    <div className="grid grid-cols-3 gap-3">
                      {[{k:'desayuno', i:Coffee, l:'Des.'}, {k:'almuerzo', i:Utensils, l:'Alm.'}, {k:'cena', i:Pizza, l:'Cena'}].map(f => (
                        <div key={f.k} className="relative">
                          <button onClick={() => setShowMealOptions(showMealOptions === f.k ? null : f.k)}
                            className={`w-full flex flex-col items-center gap-3 p-4 rounded-[28px] transition-all ${saludHoy?.comidas?.[f.k] ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 text-gray-300'}`}
                          >
                            <f.i size={20} /><span className="text-[9px] font-black uppercase">{f.l}</span>
                          </button>
                          {showMealOptions === f.k && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-2xl rounded-2xl z-50 p-1 flex flex-col gap-1 animate-in zoom-in duration-150">
                              {[{v:'nutritivo', c:'text-emerald-500'}, {v:'normal', c:'text-blue-500'}, {v:'procesado', c:'text-rose-500'}].map(o => (
                                <button key={o.v} onClick={() => { toggleComida(f.k, o.v); setShowMealOptions(null); }} className={`text-[9px] font-black uppercase py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl ${o.c}`}>{o.v}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </PremiumLock>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center px-2"><h3 className="text-[11px] font-black text-gray-400 uppercase">Hábitos Activos</h3><button onClick={() => setModalOpen('habito')} className="text-rose-600 font-bold"><Plus size={16}/></button></div>
                  {habitos.map(h => (
                    <div key={h.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-50 dark:border-gray-700 flex items-center justify-between group shadow-sm">
                       <div className="flex items-center gap-4">
                          <button onClick={() => toggleHabitCheck(h.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${saludHoy?.habitosChecks?.includes(h.id) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}><CheckCircle2 size={24}/></button>
                          <span className={`text-sm font-bold ${saludHoy?.habitosChecks?.includes(h.id) ? 'text-gray-300 dark:text-gray-600 line-through' : 'text-gray-800 dark:text-white'}`}>{h.nombre}</span>
                       </div>
                       <button onClick={() => deleteItem('habitos', h)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 6. IA COACH - NUEVO */}
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

          {/* 7. COMUNIDAD - REVOLUCIONARIO */}
          {saludSubTab === 'comunidad' && (
            <ComunidadTab
              isPro={isPro}
              saludHoy={saludHoy}
            />
          )}

          {/* 8. HISTORIAL */}
          {saludSubTab === 'historial' && (
            <div className="space-y-4">
               <PremiumLock isPro={isPro} text="Historial de Salud PRO">
                 {historialSalud.length === 0 ? (
                   <div className="py-20 text-center space-y-4 opacity-30"><Heart size={48} className="mx-auto" /><p className="text-[10px] font-black uppercase tracking-widest">Sin registros previos</p></div>
                 ) : (
                   <div className="space-y-3">
                     {historialSalud.map(dia => (
                       <div key={dia.id} className="bg-white dark:bg-gray-800 p-5 rounded-[35px] border border-gray-50 dark:border-gray-700 flex items-center justify-between shadow-sm">
                          <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase">{dia.fecha === getTodayKey() ? 'Hoy' : dia.fecha}</span><span className="text-lg font-black text-gray-900 dark:text-white">{dia.bateria}% <span className="text-[10px] text-gray-400 uppercase">Energía</span></span></div>
                          <div className="flex gap-3">
                             <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Droplets size={14} className="text-blue-500"/>
                                <span className="text-[9px] font-black text-blue-700 mt-1">{dia.agua}</span>
                             </div>
                             <div className={`flex flex-col items-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl`}>
                                <CheckCircle2 size={14} className="text-emerald-500"/>
                                <span className="text-[9px] font-black text-emerald-700 mt-1">{dia.habitosChecks?.length || 0}</span>
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
    </div>
  );
}
