import React from "react";
import { Plus, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import PremiumLock from "../../ui/PremiumLock";

export default function TerminalTabContent({ isPro, metricaUtilidad, metricaVenta, metricaCosto, formatMoney, productosDisponibles, addToCart }) {
  return (
    <div className="space-y-4 pb-44">
      <div className="p-6 bg-[#1a1c2c] text-white rounded-[35px] shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Resultado de Hoy</p>
            <PremiumLock isPro={isPro} text="Ver Utilidad">
              <h2 className="text-3xl font-black italic text-emerald-400">{formatMoney(metricaUtilidad)}</h2>
            </PremiumLock>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl"><Calculator size={20} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Ventas</p>
            <p className="font-black text-sm">{formatMoney(metricaVenta)}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Inversión (Costos)</p>
            <PremiumLock isPro={isPro} text="Sólo PRO">
              <p className="font-black text-sm text-rose-300">{formatMoney(metricaCosto)}</p>
            </PremiumLock>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-hide">
        {productosDisponibles.map((p) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(p)}
            className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 text-left space-y-1 shadow-sm"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 mb-1"><Plus size={16} /></div>
            <p className="text-[11px] font-bold text-gray-800 dark:text-white leading-tight line-clamp-2 h-7">{p.nombre}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${p.stock <= 5 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></div>
              <p className="text-[9px] font-black text-gray-400 uppercase">{p.stock} uni</p>
            </div>
            <p className="text-sm font-black text-indigo-600 pt-1">{formatMoney(p.precioVenta)}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
