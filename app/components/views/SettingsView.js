"use client";
import React, { useState } from 'react';
import { 
  LogOut, Shield, Crown, ChevronRight, CreditCard, 
  HelpCircle, UserCircle, Mail, Lock, Check, Edit2, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import PricingModal from '../ui/PricingModal';

/**
 * SETTINGS VIEW - LIFE OS EXPERT EDITION
 * Gestión de perfil, suscripción SaaS y seguridad de cuenta.
 */
export default function SettingsView({ 
  user, 
  logOut, 
  handleTogglePlan, 
  handleUpdateName,
  handleDeleteAccount 
}) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  
  const isPro = user?.plan === 'pro';

  // Función para abrir el cliente de correo del usuario
  const contactSupport = () => {
    window.location.href = "mailto:ejsalasv@gmail.com?subject=Soporte Life OS&body=Hola Erick, necesito ayuda con...";
  };

  const saveName = () => {
    if (newName.trim() !== "") {
      handleUpdateName(newName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* 1. CABECERA DE PERFIL */}
      <div className="p-8 bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm text-center relative overflow-hidden">
         <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-900 dark:bg-gray-700 rounded-[30px] flex items-center justify-center mb-4 shadow-xl border-4 border-white dark:border-gray-800">
               <span className="text-3xl">👋</span>
            </div>
            
            {isEditingName ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-indigo-100 dark:border-indigo-900"
              >
                <input 
                  autoFocus
                  className="bg-transparent outline-none font-black text-lg px-2 w-40 dark:text-white"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button 
                  onClick={saveName} 
                  className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-90 transition-transform"
                >
                  <Check size={16}/>
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight italic">
                  ¡Hola, {user?.name || 'Erick'}!
                </h2>
                <button 
                  onClick={() => setIsEditingName(true)} 
                  className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={14}/>
                </button>
              </div>
            )}
            <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest italic">
              {user?.email}
            </p>
         </div>
      </div>

      {/* 2. ESTADO DE SUSCRIPCIÓN (MODO PRUEBAS) */}
      <div className={`p-6 rounded-[35px] flex items-center justify-between border-2 transition-all duration-500 ${isPro ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-gray-800 border-dashed border-gray-200 dark:border-gray-700'}`}>
         <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isPro ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
               <Crown size={24} className={isPro ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
            </div>
            <div>
               <p className={`text-[9px] font-black uppercase tracking-widest ${isPro ? 'text-indigo-200' : 'text-gray-400'}`}>Suscripción Actual</p>
               <h3 className="text-lg font-black uppercase tracking-tighter">
                 {isPro ? 'Modo Premium' : 'Modo Gratuito'}
               </h3>
            </div>
         </div>
         
         <button 
           onClick={handleTogglePlan}
           className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isPro ? 'bg-white text-indigo-600' : 'bg-black text-white'}`}
         >
           {isPro ? 'Bajar a Free' : 'Subir a Pro'}
         </button>
      </div>

      {/* 3. MENÚ DE CONFIGURACIÓN */}
      <div className="space-y-2">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-3 italic">Ajustes de cuenta</p>
         
         <button 
           onClick={() => setIsPricingOpen(true)} 
           className="w-full p-5 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-between border border-gray-50 dark:border-gray-700 group hover:border-indigo-200 transition-all"
         >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                 <CreditCard size={18}/>
               </div>
               <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase">Tabla de Precios y Límites</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
         </button>

         <button 
           onClick={contactSupport} 
           className="w-full p-5 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-between border border-gray-100 dark:border-gray-700 group hover:border-emerald-200 transition-all"
         >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                 <HelpCircle size={18}/>
               </div>
               <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase">Soporte y Ayuda Directa</span>
            </div>
            <Mail size={16} className="text-emerald-400" />
         </button>
      </div>

      {/* 4. SESIÓN Y PELIGRO */}
      <div className="pt-6 space-y-4">
        <button 
          onClick={logOut} 
          className="w-full p-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-3xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16}/> Cerrar Sesión Segura
        </button>

        <div className="pt-10 space-y-4">
           <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 italic">Zona de Peligro</p>
           
           <button 
             onClick={handleDeleteAccount}
             className="w-full p-5 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl flex items-center justify-between group hover:bg-rose-600 transition-all duration-300"
           >
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-200 rounded-xl group-hover:bg-white dark:group-hover:bg-rose-200 group-hover:text-rose-600">
                   <Trash2 size={18}/>
                 </div>
                 <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 group-hover:text-white uppercase">
                   Eliminar mi cuenta para siempre
                 </span>
              </div>
           </button>
           <p className="text-[8px] text-center text-gray-400 font-bold uppercase px-8 leading-tight">
             Al eliminar tu cuenta, todos tus datos financieros, inventarios y registros de salud serán borrados permanentemente.
           </p>
        </div>
      </div>

      {/* MODAL DE PRECIOS */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        userPlan={user?.plan} 
        onUpgrade={handleTogglePlan}
      />
    </div>
  );
}