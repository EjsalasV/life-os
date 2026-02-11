"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, ShieldCheck, Rocket } from 'lucide-react';

export default function PricingModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  const features = [
    { n: "Inventario", free: "Hasta 5 productos", pro: "Ilimitado", icon: Zap },
    { n: "Ventas Mensuales", free: "Máximo 10", pro: "Ilimitadas", icon: Rocket },
    { n: "Cuentas (Wallet)", free: "Máximo 2", pro: "Ilimitadas", icon: ShieldCheck },
    { n: "Análisis de Utilidad", free: false, pro: true, icon: Crown },
    { n: "Exportación Excel", free: false, pro: true, icon: Crown },
    { n: "Historial de Peso", free: false, pro: true, icon: Crown },
    { n: "Edición de Tickets", free: false, pro: true, icon: Crown },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        <div className="bg-indigo-600 p-8 text-center text-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={20}/></button>
          <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Crown size={32} className="text-yellow-400 fill-current" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Life OS <span className="text-indigo-200 text-sm italic">PRO</span></h2>
          <p className="text-indigo-100 text-[10px] font-black mt-1 uppercase tracking-widest">Plan para emprendedores serios</p>
        </div>

        <div className="p-6 space-y-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400"><f.icon size={14}/></div>
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">{f.n}</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-center w-12">{f.free === false ? <X size={14} className="text-gray-200 mx-auto"/> : <span className="text-[8px] font-bold text-gray-400">Free</span>}</div>
                  <div className="text-center w-12">{f.pro === true ? <Check size={16} className="text-emerald-500 mx-auto font-black"/> : <span className="text-[8px] font-black text-indigo-600 italic">PRO</span>}</div>
               </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-700">
           <div className="mb-6">
              <span className="text-4xl font-black text-gray-900 dark:text-white">$4.99</span>
              <span className="text-gray-400 font-bold text-xs uppercase ml-2">/ Mes</span>
           </div>
           
           <button 
             onClick={onUpgrade} // <--- Ahora ejecuta la función de actualización
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
           >
             Activar Modo PRO (Prueba)
           </button>
           <p className="text-[9px] text-gray-400 font-bold mt-4 uppercase tracking-widest">Precio especial de lanzamiento</p>
        </div>
      </motion.div>
    </div>
  );
}