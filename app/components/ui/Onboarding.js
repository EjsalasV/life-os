"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ShoppingBag, Activity, Check, 
  ArrowRight, Sparkles, Crown 
} from 'lucide-react';

/**
 * ONBOARDING COMPONENT - LIFE OS
 * Tutorial interactivo de 4 pasos para nuevos usuarios.
 */
export default function Onboarding({ onFinish, userName }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      t: `¡Bienvenido, ${userName || 'Emprendedor'}!`,
      d: "Life OS es tu nuevo centro de mando. Aquí gestionarás tu dinero, tu negocio y tu salud en un solo lugar.",
      icon: <Crown size={40} className="text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
      accent: "text-amber-600"
    },
    {
      t: "Domina tu Billetera",
      d: "Registra tus gastos diarios, controla tus cuentas bancarias de Ecuador y visualiza tu balance mensual.",
      icon: <Wallet size={40} className="text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
      accent: "text-blue-600"
    },
    {
      t: "Potencia tu Negocio",
      d: "Usa la terminal de ventas para cobrar rápido, controla tu stock de productos y mira tu utilidad real.",
      icon: <ShoppingBag size={40} className="text-indigo-600" />,
      color: "bg-indigo-50 dark:bg-indigo-900/20",
      accent: "text-indigo-600"
    },
    {
      t: "Energía al Máximo",
      d: "Sigue tus hábitos diarios, mide tu batería social y mantén tu peso bajo control para rendir al 100%.",
      icon: <Activity size={40} className="text-rose-500" />,
      color: "bg-rose-50 dark:bg-rose-900/20",
      accent: "text-rose-600"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else onFinish();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      
      {/* FONDO DECORATIVO */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-200 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full max-w-sm text-center space-y-10 relative z-10"
        >
          {/* ICONO CON ANIMACIÓN DE PULSO */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-28 h-28 ${slides[step].color} rounded-[40px] flex items-center justify-center mx-auto shadow-sm border border-white/50`}
          >
             {slides[step].icon}
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                {slides[step].t}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-base leading-relaxed px-4">
                {slides[step].d}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* FOOTER DE NAVEGACIÓN */}
      <div className="absolute bottom-12 w-full max-w-sm px-8 space-y-8">
        
        {/* INDICADORES DE PASO */}
        <div className="flex justify-center gap-3">
          {slides.map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ 
                width: step === i ? 32 : 8,
                backgroundColor: step === i ? '#000' : '#e5e7eb'
              }}
              className="h-2 rounded-full" 
            />
          ))}
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full bg-black dark:bg-white dark:text-black text-white py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all"
        >
          {step === slides.length - 1 ? (
            <>¡Empecemos! <Sparkles size={18} /></>
          ) : (
            <>Continuar <ArrowRight size={18} /></>
          )}
        </motion.button>

        {step === 0 && (
            <button 
                onClick={onFinish}
                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
                Omitir tutorial
            </button>
        )}
      </div>
    </div>
  );
}