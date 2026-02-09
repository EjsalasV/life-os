"use client";
import React from 'react';
import { 
  Repeat, Zap, Droplet, Moon, Dumbbell, Timer, Utensils, Heart, 
  Plus, Pill, SunMedium, Brain, Check, Trash2, PlusCircle, BarChart2 
} from 'lucide-react';

export default function SaludView({
  saludSubTab, setSaludSubTab, saludHoy, updateHealthStat, removeWater, 
  addWater, toggleComida, habitos, toggleHabitCheck, deleteItem, historialPeso, 
  safeMonto, historialSalud, getTodayKey, setModalOpen, toggleFasting
}) {
  return (
    <>
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
         {[{ id: 'vitalidad', l: 'Vitalidad' }, { id: 'registro', l: 'Registro' }, { id: 'expediente', l: 'Expediente' }].map(t => (
           <button key={t.id} onClick={() => setSaludSubTab(t.id)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${saludSubTab === t.id ? 'bg-white shadow text-teal-600 scale-95' : 'text-gray-400'}`}>{t.l}</button>
         ))}
      </div>

      {/* 3.1 VITALIDAD */}
      {saludSubTab === 'vitalidad' && (
        <div className="space-y-6 animate-in fade-in">
           {/* BATERÍA CORPORAL */}
           <div className="bg-white border border-gray-100 p-6 rounded-[30px] shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className={`absolute top-0 w-full h-2 ${saludHoy?.bateria > 70 ? 'bg-emerald-500' : saludHoy?.bateria > 30 ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
              <div className="flex justify-between w-full mb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Batería Corporal</h3>
                  <button onClick={()=>updateHealthStat('agua', 0)} className="text-[9px] text-gray-300 hover:text-rose-500 flex items-center gap-1"><Repeat size={10}/> Reset Hoy</button>
              </div>
              
              <div className="relative w-40 h-40 flex items-center justify-center">
                 <div className={`w-full h-full rounded-full border-[8px] opacity-20 ${saludHoy?.bateria > 70 ? 'border-emerald-500' : saludHoy?.bateria > 30 ? 'border-amber-400' : 'border-rose-500'}`}></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Zap size={32} className={`mb-1 ${saludHoy?.bateria > 70 ? 'text-emerald-500 fill-emerald-500' : saludHoy?.bateria > 30 ? 'text-amber-400 fill-amber-400' : 'text-rose-500 fill-rose-500'}`} />
                    <span className="text-4xl font-black text-gray-800">{saludHoy?.bateria || 50}%</span>
                 </div>
              </div>

              <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center w-full">
                 <p className="text-xs font-bold text-gray-500">
                   {(saludHoy?.bateria || 0) < 40 ? "Necesitas recuperarte. Prioriza sueño y agua." : 
                    (saludHoy?.bateria || 0) < 80 ? "Vas bien. Un poco de ejercicio te llevaría al 100%." : 
                    "¡Energía al máximo! Rompe tus límites hoy."}
                 </p>
              </div>
           </div>

           {/* CONTADORES */}
           <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-[25px] flex flex-col items-center justify-between h-32">
                 <div className="flex items-center gap-1 text-cyan-600"><Droplet size={18} className="fill-cyan-600"/><span className="text-[10px] font-black uppercase">Agua</span></div>
                 <div className="text-3xl font-black text-cyan-900">{saludHoy?.agua || 0}<span className="text-sm text-cyan-400 font-bold">/8</span></div>
                 <div className="flex gap-2 w-full">
                    <button onClick={removeWater} className="flex-1 bg-white p-2 rounded-xl text-cyan-600 font-black shadow-sm active:scale-95">-</button>
                    <button onClick={addWater} className="flex-1 bg-cyan-500 text-white p-2 rounded-xl font-black shadow-sm active:scale-95">+</button>
                 </div>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-[25px] flex flex-col items-center justify-between h-32">
                 <div className="flex items-center gap-1 text-indigo-600"><Moon size={18} className="fill-indigo-600"/><span className="text-[10px] font-black uppercase">Sueño</span></div>
                 <div className="text-xs font-bold text-center text-indigo-900 px-1">
                    {saludHoy?.sueñoCalidad === 'bien' ? 'Descanso Óptimo' : saludHoy?.sueñoCalidad === 'mal' ? 'Mala Noche' : 'Regular'}
                 </div>
                 <div className="flex gap-1 w-full justify-center">
                    {['mal', 'regular', 'bien'].map(s => (
                       <button key={s} onClick={()=>updateHealthStat('sueñoCalidad', s)} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${saludHoy?.sueñoCalidad === s ? 'border-indigo-600 bg-indigo-200' : 'border-transparent bg-white'}`}>
                          <div className={`w-3 h-3 rounded-full ${s==='mal'?'bg-rose-400':s==='bien'?'bg-emerald-400':'bg-amber-400'}`}></div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 3.2 REGISTRO */}
      {saludSubTab === 'registro' && (
        <div className="space-y-6 animate-in fade-in">
           <div>
              <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Dumbbell size={20}/> Movimiento</h3>
              <div className="grid grid-cols-3 gap-3">
                 {[10, 20, 40].map(min => (
                    <button key={min} onClick={()=>updateHealthStat('ejercicioMinutos', min)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${parseInt(saludHoy?.ejercicioMinutos) === min ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white'}`}>
                       <Timer size={20} className={parseInt(saludHoy?.ejercicioMinutos) === min ? 'text-teal-600' : 'text-gray-300'}/>
                       <span className="font-black text-sm">{min} min</span>
                    </button>
                 ))}
              </div>
           </div>
           <div>
              <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Utensils size={20}/> Comida</h3>
              <div className="space-y-3">
                 {['Desayuno', 'Almuerzo', 'Cena'].map((comida) => (
                    <div key={comida} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                       <span className="font-bold text-sm">{comida}</span>
                       <div className="flex gap-2">
                          {['Ligero', 'Normal', 'Pesado'].map(tipo => {
                             const isSelected = saludHoy?.comidas?.[comida] === tipo;
                             return (
                             <button key={tipo} onClick={()=>toggleComida(comida, tipo)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${isSelected ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'}`}>
                                {tipo}
                             </button>
                          )})}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           <div>
              <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Heart size={20}/> Ánimo</h3>
              <div className="flex justify-between bg-white p-4 rounded-[25px] border border-gray-100">
                 {['fatal', 'mal', 'normal', 'bien', 'genial'].map(a => (
                    <button key={a} onClick={()=>updateHealthStat('animo', a)} className={`text-2xl hover:scale-125 transition-transform ${saludHoy?.animo === a ? 'scale-125 grayscale-0' : 'grayscale opacity-50'}`}>
                       {a==='fatal'?'😫':a==='mal'?'😕':a==='normal'?'😐':a==='bien'?'🙂':'🤩'}
                    </button>
                 ))}
              </div>
           </div>
           <div>
              <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Timer size={20}/> Ayuno Intermitente</h3>
              <div className={`p-6 rounded-[30px] border-2 flex flex-col items-center gap-4 transition-all ${saludHoy?.ayunoInicio ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white'}`}>
                 <span className="text-sm font-bold text-gray-500">
                    {saludHoy?.ayunoInicio ? "Ayuno en curso..." : "No has iniciado un ayuno"}
                 </span>
                 <button 
                    onClick={toggleFasting}
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                       saludHoy?.ayunoInicio ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'
                    } shadow-lg active:scale-95`}
                 >
                    {saludHoy?.ayunoInicio ? "Terminar Ayuno" : "Iniciar Ayuno"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 3.3 EXPEDIENTE */}
      {saludSubTab === 'expediente' && (
         <div className="space-y-6 animate-in fade-in">
            <div>
               <div className="flex justify-between items-center px-2 mb-3">
                  <h3 className="font-black text-lg">Protocolo Diario</h3>
                  <button onClick={()=>setModalOpen('habito')} className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Plus size={14}/> Añadir</button>
               </div>
               <div className="space-y-2">
                  {habitos.map(h => {
                     const isChecked = saludHoy?.habitosChecks?.includes(h.id);
                     const Icon = h.iconType === 'sun' ? SunMedium : h.iconType === 'brain' ? Brain : Pill;
                     
                     return (
                     <div key={h.id} className={`p-4 border rounded-2xl flex justify-between items-center group transition-colors ${isChecked ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChecked ? 'bg-teal-200 text-teal-700' : 'bg-gray-50 text-gray-400'}`}><Icon size={20}/></div>
                           <div><p className={`font-bold text-sm ${isChecked ? 'text-teal-900 line-through opacity-50' : 'text-gray-900'}`}>{h.nombre}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{h.frecuencia}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={()=>toggleHabitCheck(h.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-teal-500 border-teal-500 text-white scale-110' : 'border-gray-200 hover:border-teal-400'}`}>{isChecked && <Check size={16} strokeWidth={4} />}</button>
                           <button onClick={()=>deleteItem('habitos', h)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                     </div>
                  )})}
                  {habitos.length === 0 && <p className="text-center text-xs text-gray-400 py-4 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">Añade vitaminas, lectura o cuidados.</p>}
               </div>
            </div>

            <div>
               <div className="flex justify-between items-center px-2 mb-3">
                  <h3 className="font-black text-lg">Control de Peso</h3>
                  <button onClick={()=>setModalOpen('peso')} className="text-gray-400 hover:text-teal-600"><PlusCircle size={20}/></button>
               </div>
               <div className="bg-white p-4 rounded-[25px] border border-gray-100 h-40 flex items-end justify-between px-6 pb-2 relative">
                  <div className="absolute top-1/2 w-full h-[1px] bg-gray-100 left-0 border-dashed border-t border-gray-200"></div>
                  {historialPeso.slice(-7).map((p, i) => (
                     <div key={p.id} className="flex flex-col items-center gap-2 z-10">
                        <div className="w-3 bg-teal-300 rounded-t-full hover:bg-teal-500 transition-colors" style={{height: `${Math.min(safeMonto(p.kilos), 120)}px`}}></div>
                        <span className="text-[9px] font-bold text-gray-400">{p.kilos}</span>
                     </div>
                  ))}
                  {historialPeso.length === 0 && <p className="w-full text-center text-xs text-gray-400 self-center">Registra tu peso para ver la tendencia.</p>}
               </div>
            </div>

            <div>
               <div className="flex justify-between items-center px-2 mb-3"><h3 className="font-black text-lg">Historial</h3><BarChart2 size={18} className="text-gray-400"/></div>
               <div className="space-y-3 max-h-60 overflow-y-auto pr-1" style={{scrollbarWidth:'none'}}>
                  {historialSalud.filter(d => d.fecha !== getTodayKey()).map(dia => (
                     <div key={dia.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                        <div><p className="font-bold text-sm text-gray-600">{dia.fecha}</p><div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase mt-1"><span className="flex items-center gap-1"><Droplet size={10}/> {dia.agua}/8</span><span className="flex items-center gap-1"><Moon size={10}/> {dia.sueñoCalidad}</span></div></div>
                        <div className="flex flex-col items-end"><span className={`text-lg font-black ${dia.bateria > 70 ? 'text-emerald-500' : dia.bateria > 30 ? 'text-amber-500' : 'text-rose-500'}`}>{dia.bateria}%</span><span className="text-[9px] font-bold text-gray-400 uppercase">Energía</span></div>
                     </div>
                  ))}
                  {historialSalud.length <= 1 && <p className="text-center text-xs text-gray-400 py-4">Sin días anteriores.</p>}
               </div>
            </div>
         </div>
      )}
    </>
  );
}