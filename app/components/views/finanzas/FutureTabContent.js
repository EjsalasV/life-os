import React from "react";
import { Target, Plus, Trash2, X } from "lucide-react";
import PremiumLock from "../../ui/PremiumLock";

export default function FutureTabContent({
  isPro,
  fijos,
  metas,
  totalFijosMensuales,
  formatMoney,
  setModalOpen,
  deleteItem,
  setSelectedMeta
}) {
  return (
    <PremiumLock isPro={isPro} text="Planificación PRO">
      <div className="space-y-6">
        <div className="bg-black text-white p-6 rounded-[30px] shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Gastos Fijos Mensuales</p>
            <h2 className="text-3xl font-black">{formatMoney(totalFijosMensuales)}</h2>
          </div>
          <button onClick={() => setModalOpen("fijo")} className="relative z-10 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors active:scale-95 backdrop-blur-md"><Plus size={20} /></button>
        </div>

        <div className="space-y-2">
          {fijos.map(f => (
            <div key={f.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-black transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs text-gray-900 border border-gray-100">Dia {f.diaCobro}</div>
                <div><span className="font-bold text-sm block text-gray-900">{f.nombre}</span><span className="text-[10px] text-gray-400 font-bold uppercase">Mensual</span></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-gray-900">{formatMoney(f.monto)}</span>
                <button onClick={() => deleteItem("fijos", f)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Tus Metas</h3>
            <button onClick={() => setModalOpen("meta")} className="bg-black text-white p-1 rounded-full"><Plus size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 pb-20">
            {metas.map(m => (
              <div key={m.id} className="p-4 bg-white border border-gray-100 rounded-[25px] flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-shadow shadow-sm">
                <div>
                  <div className="flex justify-between mb-2">
                    <Target size={18} className="text-emerald-500" />
                    <button onClick={() => deleteItem("metas", m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                  <p className="font-black text-sm leading-tight mb-1 text-gray-900">{m.nombre}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{formatMoney(m.montoActual)} / {formatMoney(m.montoObjetivo)}</p>
                </div>
                <div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${m.progreso}%` }} />
                  </div>
                  <button onClick={() => { setSelectedMeta(m); setModalOpen("ahorroMeta"); }} className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:scale-95 transition-transform">Ahorrar +</button>
                </div>
              </div>
            ))}
            {metas.length === 0 && <div className="col-span-2 text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-xs font-bold text-gray-400">Sin metas no hay paraíso. <br />Crea la primera hoy.</div>}
          </div>
        </div>
      </div>
    </PremiumLock>
  );
}
