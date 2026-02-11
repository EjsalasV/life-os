"use client";
import React from 'react';
import { Wallet, ShoppingBag, Activity, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomeView({ setActiveTab, user }) {
  const isPro = user?.plan === 'pro';

  const menu = [
    { id: 'finanzas', l: 'Mi Wallet', desc: 'Dinero y Cuentas', icon: Wallet, color: 'bg-blue-500', shadow: 'shadow-blue-200' },
    { id: 'ventas', l: 'Mi Negocio', desc: 'Ventas e Inventario', icon: ShoppingBag, color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
    { id: 'salud', l: 'Mi Salud', desc: 'Hábitos y Energía', icon: Activity, color: 'bg-rose-500', shadow: 'shadow-rose-200' }
  ];

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="px-2 flex justify-between items-end">
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 italic">Bienvenido de nuevo</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Life OS</h2>
         </div>
         {isPro && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-1 font-black text-[9px] uppercase"><Sparkles size={12}/> Premium</div>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {menu.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(item.id)}
            className="w-full p-6 bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 flex items-center justify-between group shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-5">
               <div className={`w-16 h-16 ${item.color} ${item.shadow} rounded-[28px] flex items-center justify-center text-white`}>
                  <item.icon size={28} />
               </div>
               <div className="text-left">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{item.l}</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
               </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-gray-300 group-hover:text-indigo-500 transition-colors">
               <ChevronRight size={20} />
            </div>
          </motion.button>
        ))}
      </div>

      {!isPro && (
        <div className="p-6 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[40px] text-white shadow-xl relative overflow-hidden">
           <Crown className="absolute -right-4 -bottom-4 opacity-20" size={100} />
           <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Oferta Especial</p>
           <h3 className="text-xl font-black mb-3 leading-tight text-white">Lleva tu negocio al <br/>siguiente nivel</h3>
           <button 
             onClick={() => setActiveTab('settings')}
             className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
           >
             Mejorar por $5.00
           </button>
        </div>
      )}
    </div>
  );
}