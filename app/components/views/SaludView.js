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
 * SALUD VIEW - EXPERT EDITION
 * Gestión de protocolos de salud con transiciones fluidas y lógica de dirección.
 */
export default function SaludView({
  saludSubTab, setSaludSubTab, saludHoy, updateHealthStat,
  removeWater, addWater, toggleComida, habitos, toggleHabitCheck,
  deleteItem, historialPeso, historialSalud, setModalOpen, toggleFasting, getTodayKey, resetDailyHealth,
  user 
}) {
  
  const isPro = user?.plan === 'pro';
  const [fastingTime, setFastingTime] = useState('00:00:00');
  const [showMealOptions, setShowMealOptions] = useState(null);

  // --- LÓGICA DE ANIMACIÓN ---
  const tabsOrder = ['vitalidad', 'habitos', 'historial'];
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
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 relative">
        {tabsOrder.map(t => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${saludSubTab === t ? 'text-rose-600' : 'text-gray-400'}`}
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
              <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] border border-gray-100 dark:border-gray-700 shadow-sm text-center relative">
                <button 
                  onClick={resetDailyHealth} 
                  className="absolute top-8 right-8 text-gray-200 hover:text-rose-500 active:rotate-180 transition-all duration-500"
                >
                  <RefreshCw size={22}/>
                </button>
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-50 dark:text-gray-700" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${batteryLevel * 2.82} 282`} className={batteryColor} transform="rotate(-90 50 50)"
                      style={{ strokeLinecap: 'round', transition: 'all 1.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Zap size={36} className={`${batteryColor} fill-current mb-1`} />
                    <span className="text-4xl font-black tabular-nums">{batteryLevel}%</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Energía Vital</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center"><Droplets className="text-blue-500" size={24} /><span className="text-2xl font-black">{saludHoy?.agua || 0}</span></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Hidratación (Vasos)</p>
                  <div className="flex gap-2">
                    <button onClick={removeWater} className="flex-1 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl font-black">-</button>
                    <button onClick={addWater} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black">+</button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 flex flex-col justify-around items-center shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Estado de Ánimo</p>
                  <div className="flex justify-around w-full">
                    {[{k:'mal', i:Frown, c:'text-rose-500'}, {k:'normal', i:Meh, c:'text-orange-400'}, {k:'genial', i:Smile, c:'text-emerald-500'}].map(m => (
                      <button key={m.k} onClick={() => updateHealthStat('animo', m.k)} 
                        className={`p-2 rounded-xl transition-all ${saludHoy?.animo === m.k ? `${m.c} bg-gray-50 dark:bg-gray-700 scale-125` : 'text-gray-300'}`}
                      ><m.i size={28}/></button>
                    ))}
                  </div>
                </div>
              </div>

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

          {/* 2. HÁBITOS */}
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

          {/* 3. HISTORIAL */}
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